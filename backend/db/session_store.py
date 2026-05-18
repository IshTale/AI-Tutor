import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from backend.config import Settings


class SessionStore:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.session_dir = Path(settings.local_storage_dir) / "sessions"
        self.session_dir.mkdir(parents=True, exist_ok=True)
        self._memory: dict[str, list[dict[str, Any]]] = {}

    async def write_ephemeral(self, session_id: str, event: dict[str, Any]) -> None:
        await self._write(session_id, event, critical=False)

    async def write_critical(self, session_id: str, record: dict[str, Any]) -> dict[str, str]:
        await self._write(session_id, record, critical=True)
        return {"status": "ack"}

    async def get_session_log(self, session_id: str) -> list[dict[str, Any]]:
        if session_id in self._memory:
            return self._memory[session_id]
        path = self._session_path(session_id)
        if not path.exists():
            return []
        records = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
        self._memory[session_id] = records
        return records

    async def _write(self, session_id: str, payload: dict[str, Any], critical: bool) -> None:
        item = {
            "session_id": session_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "critical": critical,
            "payload": payload,
        }
        self._memory.setdefault(session_id, []).append(item)
        with self._session_path(session_id).open("a", encoding="utf-8") as file:
            file.write(json.dumps(item) + "\n")

    def _session_path(self, session_id: str) -> Path:
        safe_id = "".join(character for character in session_id if character.isalnum() or character in "-_")
        return self.session_dir / f"{safe_id or 'session'}.jsonl"
