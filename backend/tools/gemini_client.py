import struct

from google import genai
from google.genai import types

from backend.config import Settings

_TTS_SAMPLE_RATE = 24000
_TTS_CHANNELS = 1
_TTS_BIT_DEPTH = 16


def _pcm_to_wav(pcm: bytes) -> bytes:
    """Wrap raw 16-bit PCM bytes in a minimal WAV container."""
    data_len = len(pcm)
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", 36 + data_len, b"WAVE",
        b"fmt ", 16, 1,
        _TTS_CHANNELS, _TTS_SAMPLE_RATE,
        _TTS_SAMPLE_RATE * _TTS_CHANNELS * _TTS_BIT_DEPTH // 8,
        _TTS_CHANNELS * _TTS_BIT_DEPTH // 8,
        _TTS_BIT_DEPTH,
        b"data", data_len,
    )
    return header + pcm


class GeminiClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None

    @property
    def enabled(self) -> bool:
        return self._client is not None and self.settings.gemini_enabled

    async def generate_text(self, prompt: str, system: str | None = None) -> str:
        if not self.enabled:
            return (
                "Let's anchor this visually first, then connect it to the underlying idea. "
                f"For your question: {prompt[:220]}"
            )

        response = self._client.models.generate_content(
            model=self.settings.gemini_text_model,
            contents=prompt,
            config=types.GenerateContentConfig(system_instruction=system) if system else None,
        )
        return response.text or ""

    async def generate_image_bytes(self, prompt: str) -> bytes | None:
        if not self.enabled:
            return None

        response = self._client.models.generate_content(
            model=self.settings.gemini_image_model,
            contents=prompt,
            config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
        )
        for part in response.candidates[0].content.parts:
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                return inline.data
        return None

    async def generate_speech_bytes(self, text: str) -> bytes | None:
        if not self.enabled:
            return None

        response = self._client.models.generate_content(
            model=self.settings.gemini_tts_model,
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")
                    )
                ),
            ),
        )
        for part in response.candidates[0].content.parts:
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                return _pcm_to_wav(inline.data)
        return None

    async def transcribe_audio(self, audio_bytes: bytes, mime_type: str) -> str:
        if not self.enabled:
            return ""

        response = self._client.models.generate_content(
            model=self.settings.gemini_text_model,
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                "Transcribe this audio to text exactly as spoken. Return only the transcribed words, nothing else.",
            ],
        )
        return response.text.strip() if response.text else ""
