from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Root .env for local runs; in Docker compose injects it as environment variables.
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    database_url: str = "postgresql+psycopg://app:app@db:5432/app"
    secret_key: str = ""
    dev: bool = True


settings = Settings()
