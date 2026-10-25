from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://collegeai:collegeai@localhost:5432/collegeai"
    cors_origins: str = "http://localhost:3000"

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        """Accept Neon's plain libpq URL as-is and make it asyncpg-compatible."""
        if value.startswith("postgresql://"):
            value = "postgresql+asyncpg://" + value[len("postgresql://") :]
        elif value.startswith("postgres://"):
            value = "postgresql+asyncpg://" + value[len("postgres://") :]
        return value.replace("sslmode=", "ssl=")

    @property
    def cors_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
