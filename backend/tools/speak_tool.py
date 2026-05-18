from backend.tools.base import BaseTool, ToolResult


class SpeakTool(BaseTool):
    name = "speak"

    async def invoke(self, payload: dict) -> ToolResult:
        text = str(payload.get("text") or payload.get("transcript") or "")
        return ToolResult(tool=self.name, payload={"transcript": text})
