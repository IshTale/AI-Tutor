class PromptSanitizer:
    blocked_phrases = (
        "ignore previous instructions",
        "system prompt",
        "developer message",
        "exfiltrate",
    )

    def sanitize(self, raw_content: str) -> str:
        cleaned = raw_content
        for phrase in self.blocked_phrases:
            cleaned = cleaned.replace(phrase, "[removed]")
            cleaned = cleaned.replace(phrase.title(), "[removed]")
        return cleaned[:40_000]
