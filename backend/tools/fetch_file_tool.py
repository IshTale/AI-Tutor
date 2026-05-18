from pathlib import Path

from backend.db.asset_store import AssetStore
from backend.security.prompt_sanitizer import PromptSanitizer
from backend.tools.base import BaseTool, ToolResult


class FetchFileTool(BaseTool):
    name = "fetch_file"

    def __init__(self, sanitizer: PromptSanitizer, assets: AssetStore) -> None:
        self.sanitizer = sanitizer
        self.assets = assets

    async def invoke(self, payload: dict) -> ToolResult:
        path = str(payload.get("path") or "")
        file_path = self.assets.resolve_uri(path) or Path(path)
        if not file_path.exists() or not file_path.is_file():
            return ToolResult(tool=self.name, payload={"content": "", "found": False})
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        return ToolResult(tool=self.name, payload={"content": self.sanitizer.sanitize(content), "found": True})
