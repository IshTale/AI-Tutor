from backend.db.session_store import SessionStore
from backend.openclaw.react_loop import ReActLoop
from backend.tools.registry import ToolRegistry


class OpenClawAgent:
    def __init__(self, tools: ToolRegistry, react_loop: ReActLoop, sessions: SessionStore) -> None:
        self.tools = tools
        self.react_loop = react_loop
        self.sessions = sessions

    async def handle_student_text(self, session_id: str, text: str, selected_file_id: str | None = None) -> dict:
        await self.sessions.write_critical(
            session_id,
            {"type": "student_text", "text": text, "selected_file_id": selected_file_id},
        )
        plan = self.react_loop.reason(text, selected_file_id)
        opener = await self.tools.invoke("speak", {"text": plan.spoken_opener})
        results = [opener, *await self.react_loop.act(plan)]
        await self.sessions.write_critical(
            session_id,
            {"type": "resolved_task_plan", "results": [result.model_dump() for result in results]},
        )
        return {"plan": plan, "results": results}
