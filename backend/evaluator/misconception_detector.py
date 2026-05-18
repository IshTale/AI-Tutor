from pydantic import BaseModel


class MisconceptionCandidate(BaseModel):
    topic_id: str
    description: str


class MisconceptionDetector:
    def detect(self, session_log: list[dict]) -> list[MisconceptionCandidate]:
        return []
