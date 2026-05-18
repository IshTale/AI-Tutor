import asyncio
import logging

from backend.db.asset_store import AssetStore
from backend.tools.base import ToolResult
from backend.tools.gemini_client import GeminiClient
from backend.ws.event_models import (
    AgentStatusEvent,
    CameraMoveEvent,
    ImageStateEvent,
    Point,
    PointerAnimationPayload,
    TutorSpeakEvent,
)
from backend.ws.websocket_server import WebSocketHub

logger = logging.getLogger(__name__)


class Merger:
    def __init__(self, hub: WebSocketHub, gemini: GeminiClient, assets: AssetStore) -> None:
        self.hub = hub
        self.gemini = gemini
        self.assets = assets

    async def dispatch(self, client_id: str, results: list[ToolResult]) -> None:
        await self.hub.send_event(
            client_id,
            AgentStatusEvent(phase="MERGE", message="Assembling the tutor response."),
        )

        pending_transcript: str | None = None
        pending_pointer: PointerAnimationPayload | None = None

        for result in results:
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

        # Send text immediately so the UI updates without waiting for audio
        await self.hub.send_event(
            client_id,
            TutorSpeakEvent(
                transcript=pending_transcript,
                pointer_animation=pending_pointer,
            ),
        )
        await self.hub.send_event(
            client_id,
            AgentStatusEvent(phase="IDLE", message="Ready for the next question."),
        )

        # Generate TTS in the background — sends a follow-up audio event when ready
        if pending_transcript:
            asyncio.create_task(self._send_audio(client_id, pending_transcript))

    async def _send_audio(self, client_id: str, text: str) -> None:
        try:
            wav_bytes = await self.gemini.generate_speech_bytes(text)
            if wav_bytes:
                audio_url = await self.assets.put_bytes(wav_bytes, "audio/wav", "tts")
                logger.info("Gemini TTS OK: %d bytes → %s", len(wav_bytes), audio_url)
                await self.hub.send_event(
                    client_id,
                    TutorSpeakEvent(audio_url=audio_url),
                )
        except Exception as exc:
            logger.warning("TTS failed: %s", exc)
