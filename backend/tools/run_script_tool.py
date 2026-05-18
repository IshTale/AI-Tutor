from backend.db.asset_store import AssetStore
from backend.security.sandbox import DockerSandbox
from backend.tools.base import BaseTool, ToolResult


class RunScriptTool(BaseTool):
    name = "run_script"

    def __init__(self, sandbox: DockerSandbox, assets: AssetStore) -> None:
        self.sandbox = sandbox
        self.assets = assets

    async def invoke(self, payload: dict) -> ToolResult:
        result = await self.sandbox.run(str(payload.get("code") or ""), payload.get("inputs") or {})
        return ToolResult(tool=self.name, payload=result)
