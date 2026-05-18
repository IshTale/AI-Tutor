from html import escape

from backend.db.asset_store import AssetStore
from backend.tools.base import BaseTool, ToolResult


class GenerateTool(BaseTool):
    name = "generate"

    def __init__(self, assets: AssetStore) -> None:
        self.assets = assets

    async def invoke(self, payload: dict) -> ToolResult:
        instruction = str(payload.get("instruction") or payload.get("prompt") or "Explain the concept visually.")
        uri = await self.assets.put_data_uri_svg(self._fallback_svg(instruction))
        return ToolResult(tool=self.name, payload={"image_uri": uri})

    def _fallback_svg(self, instruction: str) -> str:
        safe = escape(instruction[:110])
        return f"""
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="#fbfbf8"/>
  <g stroke="#d8e2df" stroke-width="2" opacity=".75">
    <path d="M0 180h1920M0 340h1920M0 500h1920M0 660h1920M0 820h1920"/>
    <path d="M220 0v1080M420 0v1080M620 0v1080M820 0v1080M1020 0v1080M1220 0v1080M1420 0v1080M1620 0v1080"/>
  </g>
  <text x="280" y="260" font-family="Inter, Arial" font-size="64" font-weight="700" fill="#223836">GuardRail</text>
  <text x="285" y="345" font-family="Inter, Arial" font-size="34" fill="#44524f">{safe}</text>
  <path d="M420 790 C 620 440, 920 400, 1260 690" fill="none" stroke="#1f7a6b" stroke-width="12" stroke-linecap="round"/>
  <circle cx="925" cy="506" r="18" fill="#ff3d59"/>
</svg>"""
