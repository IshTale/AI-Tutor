from backend.tools.base import BaseTool, ToolResult


class BrowseTool(BaseTool):
    name = "browse"

    async def invoke(self, payload: dict) -> ToolResult:
        query = str(payload.get("query") or "")
        return ToolResult(
            tool=self.name,
            payload={
                "query": query,
                "content": "Browsing is intentionally disabled in the local backend scaffold.",
            },
        )
