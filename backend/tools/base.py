from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class ToolResult(BaseModel):
    tool: str
    payload: dict[str, Any]


class BaseTool(ABC):
    name: str

    @abstractmethod
    async def invoke(self, payload: dict[str, Any]) -> ToolResult:
        raise NotImplementedError
