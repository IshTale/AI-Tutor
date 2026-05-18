import anthropic

from backend.config import Settings


class ClaudeClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None

    @property
    def enabled(self) -> bool:
        return self._client is not None

    async def generate_text(self, prompt: str, system: str | None = None) -> str:
        if not self.enabled:
            return (
                "GuardRail is not configured yet — add ANTHROPIC_API_KEY to backend/.env to enable responses."
            )

        kwargs: dict = {
            "model": self.settings.claude_model,
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            kwargs["system"] = system

        response = self._client.messages.create(**kwargs)
        return response.content[0].text or ""
