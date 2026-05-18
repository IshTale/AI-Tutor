import base64

from backend.tools.base import BaseTool, ToolResult


class SpeakTool(BaseTool):
    name = "speak"

    async def invoke(self, payload: dict) -> ToolResult:
        text = str(payload.get("text") or "")
        audio_url = "data:audio/wav;base64," + base64.b64encode(b"").decode("ascii")
        return ToolResult(tool=self.name, payload={"audio_url": audio_url, "transcript": text})
