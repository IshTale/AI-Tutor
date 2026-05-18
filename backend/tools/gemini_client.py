from google import genai
from google.genai import types

from backend.config import Settings


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
