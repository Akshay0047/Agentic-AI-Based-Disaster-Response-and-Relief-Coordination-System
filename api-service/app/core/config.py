from functools import lru_cache
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", case_sensitive=False
    )

    # Application
    app_name: str = "Disaster Response System"
    environment: str = "local"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Security / JWT
    secret_key: str = "insecure-dev-secret-key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 120

    # PostgreSQL
    postgres_user: str = "drs"
    postgres_password: str = "drs_password"
    postgres_db: str = "disaster_response"
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    database_url: str | None = None
    database_url_sync: str | None = None

    # SQS
    sqs_emergency_queue: str = "emergency-requests"
    sqs_replan_queue: str = "replan-events"
    sqs_endpoint_url: str | None = None
    aws_region: str = "us-east-1"
    sqs_enabled: bool = False

    @field_validator("database_url", mode="before")
    @classmethod
    def _build_async_url(cls, v: Any) -> Any:
        if v:
            return v
        return None

    def get_async_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    def get_sync_database_url(self) -> str:
        if self.database_url_sync:
            return self.database_url_sync
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()