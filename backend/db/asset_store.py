import base64
import hashlib
import mimetypes
from pathlib import Path

from backend.config import Settings


class AssetStore:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.storage_dir = Path(settings.local_storage_dir)
        self.asset_dir = self.storage_dir / "assets"
        self.asset_dir.mkdir(parents=True, exist_ok=True)

    async def put_bytes(self, data: bytes, content_type: str, prefix: str) -> str:
        digest = hashlib.sha256(data).hexdigest()[:16]
        extension = mimetypes.guess_extension(content_type) or ".bin"
        extension = ".png" if content_type == "image/png" else extension
        extension = ".wav" if content_type == "audio/wav" else extension
        target_dir = self.asset_dir / prefix
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / f"{digest}{extension}"
        target.write_bytes(data)
        return f"/local-assets/{prefix}/{target.name}"

    async def put_data_uri_svg(self, svg: str) -> str:
        encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
        return f"data:image/svg+xml;base64,{encoded}"

    def resolve_uri(self, uri: str) -> Path | None:
        prefix = "/local-assets/"
        if not uri.startswith(prefix):
            return None
        relative = uri.removeprefix(prefix)
        candidate = (self.asset_dir / relative).resolve()
        asset_root = self.asset_dir.resolve()
        if candidate != asset_root and asset_root not in candidate.parents:
            return None
        return candidate
