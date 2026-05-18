from backend.tools.base import BaseTool, ToolResult
from backend.tools.gemini_client import GeminiClient


class ReasonTool(BaseTool):
    name = "reason"

    def __init__(self, gemini: GeminiClient) -> None:
        self.gemini = gemini

    async def invoke(self, payload: dict) -> ToolResult:
        prompt = str(payload.get("prompt") or payload.get("query") or "")
        mastery = payload.get("mastery", "unknown")
        text = await self.gemini.generate_text(
            prompt,
            system=(
                "You are a concise, supportive AI tutor. Explain at the student's level, "
                f"using mastery context: {mastery}."
            ),
        )
        return ToolResult(tool=self.name, payload={"text": text})
