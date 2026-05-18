from datetime import datetime, timezone
from typing import Any

from botocore.exceptions import BotoCoreError, ClientError

from backend.config import Settings
from backend.db.aws_clients import AwsClients


class SessionStore:
    def __init__(self, settings: Settings, aws: AwsClients) -> None:
        self.settings = settings
        self.aws = aws
        self._memory: dict[str, list[dict[str, Any]]] = {}

    async def write_ephemeral(self, session_id: str, event: dict[str, Any]) -> None:
        await self._write(session_id, event, critical=False)

    async def write_critical(self, session_id: str, record: dict[str, Any]) -> dict[str, str]:
        await self._write(session_id, record, critical=True)
        return {"status": "ack"}

    async def get_session_log(self, session_id: str) -> list[dict[str, Any]]:
        return self._memory.get(session_id, [])

    async def _write(self, session_id: str, payload: dict[str, Any], critical: bool) -> None:
        item = {
            "session_id": session_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "critical": critical,
            "payload": payload,
        }
        self._memory.setdefault(session_id, []).append(item)

        if self.settings.ai_tutor_dev_fallback:
            return

        try:
            table = self.aws.dynamodb.Table(self.settings.aws_dynamodb_session_table)
            table.put_item(Item=item)
        except (BotoCoreError, ClientError) as exc:
            if critical:
                raise RuntimeError("Failed to persist critical session record") from exc
