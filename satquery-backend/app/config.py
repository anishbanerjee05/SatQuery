from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openrouter_api_key: str
    openrouter_vision_model: str
    openrouter_vision_model_fallback: str
    openrouter_text_model: str
    openrouter_text_model_fallback: str
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    database_url: str

    storage_endpoint: str
    storage_access_key: str
    storage_secret_key: str
    storage_bucket: str
    storage_region: str = "auto"

    app_host: str = "0.0.0.0"
    app_port: int = 8000


settings = Settings()