from typing import Literal

from pydantic import BaseModel


class Edge(BaseModel):
    source_id: str
    target_id: str
    type: Literal["PREREQ", "UNDERPINS", "CORRUPTS"]
