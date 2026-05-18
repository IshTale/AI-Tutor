from backend.tools.base import BaseTool, ToolResult


class AnimateTool(BaseTool):
    name = "animate"

    async def invoke(self, payload: dict) -> ToolResult:
        focus_x = float(payload.get("x", 925))
        focus_y = float(payload.get("y", 506))
        return ToolResult(
            tool=self.name,
            payload={
                "camera": {"scale": 1.28, "center": {"x": focus_x, "y": focus_y}, "duration_ms": 900},
                "pointer_animation": {
                    "type": "bezier",
                    "P0": [focus_x - 430, focus_y + 280],
                    "P1": [focus_x - 230, focus_y - 160],
                    "P2": [focus_x, focus_y],
                    "duration_ms": 1450,
                },
            },
        )
