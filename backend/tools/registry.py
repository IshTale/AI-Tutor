from backend.tools.base import BaseTool, ToolResult


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool

    async def invoke(self, name: str, payload: dict) -> ToolResult:
        if name not in self._tools:
            raise KeyError(f"Unknown tool: {name}")
        return await self._tools[name].invoke(payload)

    @property
    def names(self) -> list[str]:
        return sorted(self._tools)
