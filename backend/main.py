import logging
import traceback
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, Request, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)
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
from backend.ws.event_models import AgentStatusEvent, TutorSpeakEvent
from backend.ws.websocket_server import WebSocketHub


settings = get_settings()
assets = AssetStore(settings)
sessions = SessionStore(settings)
gemini = GeminiClient(settings)
hub = WebSocketHub()
merger = Merger(hub, gemini, assets)


def build_tool_registry() -> ToolRegistry:
    registry = ToolRegistry()
    sanitizer = PromptSanitizer()
    sandbox = DockerSandbox()
    registry.register(ReasonTool(gemini, settings))
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
    allow_origins=[settings.frontend_origin],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
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


@app.get("/test-tts")
async def test_tts(text: str = "Hello, this is a test of Gemini text to speech.") -> dict:
    import base64
    wav_bytes = await gemini.generate_speech_bytes(text)
    if not wav_bytes:
        return {"ok": False, "error": "No audio returned"}
    return {"ok": True, "bytes": len(wav_bytes), "audio_url": f"data:audio/wav;base64,{base64.b64encode(wav_bytes).decode()}"}


@app.post("/transcribe")
async def transcribe_audio(request: Request) -> dict:
    audio_bytes = await request.body()
    mime_type = request.headers.get("content-type", "audio/webm")
    transcript = await gemini.transcribe_audio(audio_bytes, mime_type)
    return {"transcript": transcript}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    client_id = websocket.query_params.get("client_id") or str(uuid4())
    last_seq = int(websocket.query_params.get("last_seq") or 0)
    session_id = websocket.query_params.get("session_id") or client_id

    await hub.connect(client_id, websocket, last_seq)
    await hub.send_event(
        client_id,
        AgentStatusEvent(phase="IDLE", message="Connected to GuardRail."),
    )
    await hub.send_event(
        client_id,
        TutorSpeakEvent(
            transcript=(
                "Hi, I'm GuardRail. My job is to help you understand how your technology operates — "
                "specifically the architecture and inner workings of your legacy systems. "
                "I have access to your systems' information and can walk you through how everything connects. "
                "Ask me anything."
            ),
        ),
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
                try:
                    result = await agent.handle_student_text(
                        session_id=session_id,
                        text=text,
                        selected_file_id=message.get("selectedFileId"),
                    )
                    await merger.dispatch(client_id, result["results"])
                except Exception as exc:
                    logger.error("Agent error: %s\n%s", exc, traceback.format_exc())
                    await hub.send_event(client_id, TutorSpeakEvent(transcript=f"Sorry, something went wrong: {exc}"))

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
