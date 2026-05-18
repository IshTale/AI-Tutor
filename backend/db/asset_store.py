import base64
import hashlib
from pathlib import Path

from botocore.exceptions import BotoCoreError, ClientError

from backend.config import Settings
from backend.db.aws_clients import AwsClients


class AssetStore:
    def __init__(self, settings: Settings, aws: AwsClients) -> None:
        self.settings = settings
        self.aws = aws
        self.cache_dir = Path(__file__).resolve().parents[1] / "cache"
        self.cache_dir.mkdir(exist_ok=True)

    async def put_bytes(self, data: bytes, content_type: str, prefix: str) -> str:
        digest = hashlib.sha256(data).hexdigest()[:16]
        extension = "png" if "png" in content_type else "bin"
        key = f"{prefix}/{digest}.{extension}"

        if not self.settings.ai_tutor_dev_fallback:
            try:
                self.aws.s3.put_object(
                    Bucket=self.settings.aws_s3_bucket,
                    Key=key,
                    Body=data,
                    ContentType=content_type,
                )
                return f"https://{self.settings.aws_s3_bucket}.s3.{self.settings.aws_region}.amazonaws.com/{key}"
            except (BotoCoreError, ClientError):
                pass

        target = self.cache_dir / key.replace("/", "_")
        target.write_bytes(data)
        return f"/cache/{target.name}"

    async def put_data_uri_svg(self, svg: str) -> str:
        encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
        return f"data:image/svg+xml;base64,{encoded}"
