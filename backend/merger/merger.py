from backend.tools.base import ToolResult
from backend.ws.event_models import (
    AgentStatusEvent,
    CameraMoveEvent,
    ImageStateEvent,
    Point,
    PointerAnimationPayload,
    TutorSpeakEvent,
)
from backend.ws.websocket_server import WebSocketHub


class Merger:
    def __init__(self, hub: WebSocketHub) -> None:
        self.hub = hub

    async def dispatch(self, client_id: str, results: list[ToolResult]) -> None:
        await self.hub.send_event(
            client_id,
            AgentStatusEvent(phase="MERGE", message="Assembling the tutor response."),
        )

        pending_transcript: str | None = None
        pending_audio: str | None = None
        pending_pointer: PointerAnimationPayload | None = None

        for result in results:
            if result.tool == "speak":
                pending_transcript = result.payload.get("transcript")
                pending_audio = result.payload.get("audio_url")

            if result.tool == "reason":
                pending_transcript = result.payload.get("text")

            if result.tool == "generate":
                await self.hub.send_event(
                    client_id,
                    ImageStateEvent(image_uri=result.payload["image_uri"]),
                )

            if result.tool == "animate":
                camera = result.payload["camera"]
                pointer = result.payload["pointer_animation"]
                pending_pointer = PointerAnimationPayload(**pointer)
                await self.hub.send_event(
                    client_id,
                    CameraMoveEvent(
                        scale=camera["scale"],
                        center=Point(**camera["center"]),
                        duration_ms=camera["duration_ms"],
                    ),
                )

        await self.hub.send_event(
            client_id,
            TutorSpeakEvent(
                audio_url=pending_audio,
                transcript=pending_transcript,
                pointer_animation=pending_pointer,
            ),
        )
        await self.hub.send_event(
            client_id,
            AgentStatusEvent(phase="IDLE", message="Ready for the next question."),
        )
