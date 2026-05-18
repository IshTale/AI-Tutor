from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import get_settings
from backend.db.asset_store import AssetStore
from backend.db.session_store import SessionStore
from backend.merger.merger import Merger
from backend.openclaw.agent import OpenClawAgent
from backend.openclaw.react_loop import ReActLoop
from backend.security.prompt_sanitizer import PromptSanitizer
from backend.security.rate_limiter import RateLimiter
from backend.security.sandbox import DockerSandbox
from backend.tools.animate_tool import AnimateTool
from backend.tools.browse_tool import BrowseTool
from backend.tools.fetch_file_tool import FetchFileTool
from backend.tools.gemini_client import GeminiClient
from backend.tools.generate_tool import GenerateTool
from backend.tools.reason_tool import ReasonTool
from backend.tools.registry import ToolRegistry
from backend.tools.run_script_tool import RunScriptTool
from backend.tools.speak_tool import SpeakTool
from backend.ws.event_models import AgentStatusEvent
from backend.ws.websocket_server import WebSocketHub


settings = get_settings()
assets = AssetStore(settings)
sessions = SessionStore(settings)
gemini = GeminiClient(settings)
hub = WebSocketHub()
merger = Merger(hub)


def build_tool_registry() -> ToolRegistry:
    registry = ToolRegistry()
    sanitizer = PromptSanitizer()
    sandbox = DockerSandbox()
    registry.register(ReasonTool(gemini))
    registry.register(GenerateTool(gemini, assets))
    registry.register(SpeakTool())
    registry.register(AnimateTool())
    registry.register(FetchFileTool(sanitizer, assets))
    registry.register(RunScriptTool(sandbox, assets))
    registry.register(BrowseTool())
    return registry


tools = build_tool_registry()
react_loop = ReActLoop(tools, RateLimiter())
agent = OpenClawAgent(tools, react_loop, sessions)

app = FastAPI(title="AI Tutor Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

local_asset_dir = Path(settings.local_storage_dir) / "assets"
local_asset_dir.mkdir(parents=True, exist_ok=True)
app.mount("/local-assets", StaticFiles(directory=local_asset_dir), name="local-assets")


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "tools": tools.names,
        "storage": "local",
        "local_storage_dir": settings.local_storage_dir,
        "gemini_enabled": gemini.enabled,
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)) -> dict:
    data = await file.read()
    uri = await assets.put_bytes(data, file.content_type or "application/octet-stream", "uploads")
    return {
        "file_id": uri,
        "name": file.filename,
        "size": len(data),
        "mime_type": file.content_type or "application/octet-stream",
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    client_id = websocket.query_params.get("client_id") or str(uuid4())
    last_seq = int(websocket.query_params.get("last_seq") or 0)
    session_id = websocket.query_params.get("session_id") or client_id

    await hub.connect(client_id, websocket, last_seq)
    await hub.send_event(
        client_id,
        AgentStatusEvent(phase="IDLE", message="Connected to OpenClaw backend."),
    )

    try:
        while True:
            message = await websocket.receive_json()
            message_type = message.get("type")

            if message_type == "student_text":
                text = str(message.get("text") or "").strip()
                if not text:
                    continue

                await hub.send_event(
                    client_id,
                    AgentStatusEvent(phase="OBSERVE", message="OpenClaw received the student prompt."),
                )
                await hub.send_event(
                    client_id,
                    AgentStatusEvent(phase="REASON", message="Planning the tool graph."),
                )
                result = await agent.handle_student_text(
                    session_id=session_id,
                    text=text,
                    selected_file_id=message.get("selectedFileId"),
                )
                await merger.dispatch(client_id, result["results"])

            elif message_type == "push_to_talk":
                active = bool(message.get("active"))
                await hub.send_event(
                    client_id,
                    AgentStatusEvent(
                        phase="OBSERVE" if active else "IDLE",
                        message="Listening for speech." if active else "Push-to-talk released.",
                    ),
                )

            elif message_type == "interrupt":
                await hub.send_event(
                    client_id,
                    AgentStatusEvent(phase="IDLE", message="Tutor response interrupted."),
                )

            elif message_type == "select_file":
                await sessions.write_ephemeral(session_id, {"type": "select_file", "file_id": message.get("fileId")})

            elif message_type == "upload_file":
                await sessions.write_critical(session_id, {"type": "upload_file", **message})

    except WebSocketDisconnect:
        hub.disconnect(client_id)
