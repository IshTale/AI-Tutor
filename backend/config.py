from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

env_path = Path(__file__).resolve().with_name(".env")


class Settings(BaseSettings):
    local_storage_dir: str = "backend/local_data"
    knowledge_base_dir: str = "backend/knowledge_base"
    anthropic_api_key: str | None = None
    claude_model: str = "claude-sonnet-4-6"
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=env_path, env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
