import base64

from botocore.exceptions import BotoCoreError, ClientError

from backend.config import Settings
from backend.db.asset_store import AssetStore
from backend.db.aws_clients import AwsClients
from backend.tools.base import BaseTool, ToolResult


class SpeakTool(BaseTool):
    name = "speak"

    def __init__(self, settings: Settings, aws: AwsClients, assets: AssetStore) -> None:
        self.settings = settings
        self.aws = aws
        self.assets = assets

    async def invoke(self, payload: dict) -> ToolResult:
        text = str(payload.get("text") or "")
        audio_url = None

        if not self.settings.ai_tutor_dev_fallback:
            try:
                response = self.aws.polly.synthesize_speech(
                    Text=text,
                    OutputFormat="mp3",
                    VoiceId=self.settings.aws_polly_voice_id,
                    Engine="neural",
                )
                data = response["AudioStream"].read()
                audio_url = await self.assets.put_bytes(data, "audio/mpeg", "speech")
            except (BotoCoreError, ClientError, KeyError):
                audio_url = None

        if not audio_url:
            audio_url = "data:audio/wav;base64," + base64.b64encode(b"").decode("ascii")

        return ToolResult(tool=self.name, payload={"audio_url": audio_url, "transcript": text})
