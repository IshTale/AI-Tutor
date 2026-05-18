from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    aws_region: str = "us-west-2"
    aws_s3_bucket: str = "ai-tutor-assets"
    aws_dynamodb_session_table: str = "ai_tutor_sessions"
    aws_polly_voice_id: str = "Joanna"
    gemini_api_key: str | None = None
    gemini_text_model: str = "gemini-2.5-flash"
    gemini_image_model: str = "gemini-2.5-flash-image"
    ai_tutor_dev_fallback: bool = True
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
