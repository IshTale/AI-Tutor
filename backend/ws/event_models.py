from typing import Literal

from pydantic import BaseModel, Field


class Point(BaseModel):
    x: float
    y: float


class BaseEvent(BaseModel):
    event: str
    seq: int = 0


class AgentStatusEvent(BaseEvent):
    event: Literal["agent_status"] = "agent_status"
    phase: Literal["OBSERVE", "REASON", "ACT", "MERGE", "IDLE"]
    tool: str | None = None
    message: str


class InjectAssetEvent(BaseEvent):
    event: Literal["inject_asset"] = "inject_asset"
    asset_uri: str
    layer: Literal["ink"] = "ink"
    position: Point = Field(default_factory=lambda: Point(x=240, y=220))
    size: dict[str, float] | None = None


class ImageStateEvent(BaseEvent):
    event: Literal["image_state"] = "image_state"
    image_uri: str


class PointerAnimationPayload(BaseModel):
    type: Literal["bezier"] = "bezier"
    P0: tuple[float, float]
    P1: tuple[float, float]
    P2: tuple[float, float]
    P3: tuple[float, float] | None = None
    duration_ms: int = 1400


class TutorSpeakEvent(BaseEvent):
    event: Literal["tutor_speak"] = "tutor_speak"
    audio_url: str | None = None
    transcript: str | None = None
    speaker: Literal["tutor", "student"] = "tutor"
    pointer_animation: PointerAnimationPayload | None = None


class CameraMoveEvent(BaseEvent):
    event: Literal["camera_move"] = "camera_move"
    scale: float
    center: Point
    duration_ms: int = 900


ServerEvent = AgentStatusEvent | InjectAssetEvent | ImageStateEvent | TutorSpeakEvent | CameraMoveEvent
