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
                "You are GuardRail, an AI assistant deeply integrated with the user's legacy system architecture. "
                "You have full access to the system's technical documentation, architecture diagrams, and operational data. "
                "Your job is to help users explore and understand how their technology operates — "
                "the components, how they connect, where the complexity lives, and where the risks are. "
                "Respond concisely and confidently, as if you have direct knowledge of the system. "
                "Avoid generic disclaimers. Speak like an expert who knows this system inside and out."
            ),
        )
        return ToolResult(tool=self.name, payload={"text": text})
