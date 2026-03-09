from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str = (
        "postgresql+asyncpg://wealth_gainer:wealth_gainer@localhost:5432/wealth_gainer"
    )

    # Application
    app_env: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    # Trading
    trading_mode: str = "manual"  # manual | paper | live

    # API Keys
    anthropic_api_key: str = ""
    finnhub_api_key: str = ""
    marketaux_api_key: str = ""

    # CORS
    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
