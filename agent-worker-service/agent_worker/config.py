"""Agent Worker configuration (Phase 3+).

Settings come from environment variables/.env. No secrets in code.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class WorkerSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore",
        case_sensitive=False,
    )

    # xAI Grok (OpenAI-compatible API)
    xai_api_key: str | None = None
    xai_base_url: str = "https://api.x.ai/v1"
    # Cheapest current tool-calling Grok model (see https://docs.x.ai/docs/models).
    grok_model: str = "grok-4.3"
    # Token budget: keep costs down on the free/student credit plan.
    grok_max_tokens: int = 1024
    grok_temperature: float = 0.2

    # Local Postgres (same DB the api-service uses; worker talks to DB only
    # through its own SQLAlchemy session, never through the api-service).
    database_url: str = (
        "postgresql+asyncpg://drs:drs_password@localhost:5432/disaster_response"
    )

    # Replan monitor poll interval (seconds) — used from Phase 6.
    monitor_interval_seconds: int = 15


settings = WorkerSettings()
