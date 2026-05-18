from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

env_path = Path(__file__).resolve().with_name(".env")


class Settings(BaseSettings):
    local_storage_dir: str = "backend/local_data"
    gemini_api_key: str | None = None
    gemini_text_model: str = "gemini-2.5-flash"
    gemini_image_model: str = "gemini-2.5-flash-image"
    gemini_enabled: bool = True
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=env_path, env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
