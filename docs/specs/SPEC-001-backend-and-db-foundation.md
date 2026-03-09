# SPEC-001: Backend & Database Foundation

## Summary

Set up the foundational Python backend service and PostgreSQL database for the Wealth Gainer
project. This includes: project scaffolding with dependency management, a FastAPI application
with health check endpoint, the complete PostgreSQL schema for all 14 tables defined in the
architecture, Alembic migration infrastructure, and environment-based configuration. This is
the skeleton that every subsequent feature (data pipelines, AI agents, trade executor,
dashboard) will build upon.

## Background

- **Feature request:** [FEATURE-001](../backlog/FEATURE-001-backend-and-db-foundation.md)
- **Architecture reference:** [ARCHITECTURE.md](../ARCHITECTURE.md) Section 7 (Data Storage)
- **Project plan milestone:** A3 (Backend + DB)
- **Priority:** High -- blocks all other work
- **Dependencies:** None -- this is the first implementation milestone

The project currently consists only of documentation (docs/). No code exists yet. This spec
defines everything needed to go from zero to a running backend with an empty but fully-
structured database.

## Requirements

- [ ] R1: Python project with clear directory structure and dependency management (Poetry)
- [ ] R2: FastAPI server starts on `localhost:8000` and serves `GET /api/v1/health`
- [ ] R3: PostgreSQL database connection via SQLAlchemy async engine
- [ ] R4: All 14 tables created via Alembic initial migration (up and down)
- [ ] R5: Complete database schema matching ARCHITECTURE.md Section 7, fully typed
- [ ] R6: `.env` file for configuration (DB URL, API key placeholders, trading mode)
- [ ] R7: `.gitignore` excludes secrets, caches, IDE files, virtual environments
- [ ] R8: Structured logging configured (JSON format for future parsing)
- [ ] R9: CORS middleware enabled (for future React dashboard on localhost:5173)
- [ ] R10: Pydantic settings class for typed configuration

---

## Technical Design

### 1. Project Directory Structure

All paths are relative to the repository root: `/Users/user/Desktop/study/wealth-gainer/`

```
wealth-gainer/
|-- docs/                          # Already exists (project documentation)
|-- backend/                       # Python backend root
|   |-- pyproject.toml             # Poetry project definition + dependencies
|   |-- poetry.lock                # Locked dependency versions (auto-generated)
|   |-- alembic.ini                # Alembic configuration
|   |-- .env                       # Local environment variables (git-ignored)
|   |-- .env.example               # Template for .env (committed to git)
|   |-- app/
|   |   |-- __init__.py
|   |   |-- main.py                # FastAPI app creation + startup/shutdown
|   |   |-- config.py              # Pydantic Settings (reads .env)
|   |   |-- database.py            # SQLAlchemy async engine + session factory
|   |   |-- models/
|   |   |   |-- __init__.py        # Imports all models (for Alembic auto-detect)
|   |   |   |-- base.py            # DeclarativeBase class
|   |   |   |-- stock.py           # Stock model
|   |   |   |-- price.py           # Price model
|   |   |   |-- indicator.py       # Indicator model
|   |   |   |-- fundamental.py     # Fundamental model
|   |   |   |-- news.py            # News model
|   |   |   |-- recommendation.py  # Recommendation model
|   |   |   |-- portfolio.py       # Portfolio model
|   |   |   |-- order.py           # Order model
|   |   |   |-- agent_log.py       # AgentLog model
|   |   |   |-- watchlist.py       # Watchlist model
|   |   |   |-- market_regime.py   # MarketRegime model
|   |   |   |-- risk_report.py     # RiskReport model
|   |   |   |-- trade_outcome.py   # TradeOutcome model
|   |   |   |-- performance_report.py  # PerformanceReport model
|   |   |-- routes/
|   |   |   |-- __init__.py
|   |   |   |-- health.py          # GET /api/v1/health
|   |   |-- schemas/
|   |   |   |-- __init__.py
|   |   |   |-- health.py          # HealthResponse schema
|   |-- migrations/
|   |   |-- env.py                 # Alembic env (async-aware)
|   |   |-- script.py.mako         # Migration template
|   |   |-- versions/
|   |   |   |-- 001_initial_schema.py  # Initial migration (all 14 tables)
|-- .gitignore                     # Root gitignore
```

### 2. Dependencies (pyproject.toml)

**Python version:** 3.12+

**Runtime dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | ^0.115.0 | Web framework |
| uvicorn[standard] | ^0.34.0 | ASGI server |
| sqlalchemy[asyncio] | ^2.0.36 | ORM + async support |
| asyncpg | ^0.30.0 | Async PostgreSQL driver |
| alembic | ^1.14.0 | Database migrations |
| pydantic | ^2.10.0 | Data validation (bundled with FastAPI) |
| pydantic-settings | ^2.7.0 | Settings management from .env |
| python-dotenv | ^1.0.1 | .env file loading |
| structlog | ^24.4.0 | Structured logging |

**Dev dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| pytest | ^8.3.0 | Testing framework |
| pytest-asyncio | ^0.24.0 | Async test support |
| httpx | ^0.28.0 | Async HTTP client for testing FastAPI |
| ruff | ^0.8.0 | Linter + formatter |

**Full `pyproject.toml`:**

```toml
[tool.poetry]
name = "wealth-gainer-backend"
version = "0.1.0"
description = "Personal AI-powered hedge fund — backend service"
authors = ["Wealth Gainer"]
readme = "README.md"
packages = [{include = "app"}]

[tool.poetry.dependencies]
python = "^3.12"
fastapi = "^0.115.0"
uvicorn = {version = "^0.34.0", extras = ["standard"]}
sqlalchemy = {version = "^2.0.36", extras = ["asyncio"]}
asyncpg = "^0.30.0"
alembic = "^1.14.0"
pydantic = "^2.10.0"
pydantic-settings = "^2.7.0"
python-dotenv = "^1.0.1"
structlog = "^24.4.0"

[tool.poetry.group.dev.dependencies]
pytest = "^8.3.0"
pytest-asyncio = "^0.24.0"
httpx = "^0.28.0"
ruff = "^0.8.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.ruff]
target-version = "py312"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP", "B", "SIM", "RUF"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

### 3. Environment Configuration

**`backend/.env.example`** (committed to git):

```env
# ── Database ──
DATABASE_URL=postgresql+asyncpg://wealth_gainer:wealth_gainer@localhost:5432/wealth_gainer

# ── Application ──
APP_ENV=development
DEBUG=true
LOG_LEVEL=INFO

# ── Trading ──
TRADING_MODE=manual

# ── API Keys (fill in with real values in .env) ──
ANTHROPIC_API_KEY=
FINNHUB_API_KEY=
MARKETAUX_API_KEY=

# ── CORS ──
CORS_ORIGINS=["http://localhost:5173"]
```

**`backend/app/config.py`:**

```python
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
```

### 4. FastAPI Application Structure

**`backend/app/main.py`:**

```python
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.routes import health

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Wealth Gainer backend", env=settings.app_env)
    yield
    await engine.dispose()
    logger.info("Wealth Gainer backend shut down")


app = FastAPI(
    title="Wealth Gainer API",
    version="0.1.0",
    description="Personal AI-powered hedge fund",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
```

**`backend/app/database.py`:**

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=5,
    max_overflow=10,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncSession:
    async with async_session_factory() as session:
        yield session
```

**`backend/app/routes/health.py`:**

```python
from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", version="0.1.0")
```

**`backend/app/schemas/health.py`:**

```python
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    version: str
```

### 5. SQLAlchemy Model Base

**`backend/app/models/base.py`:**

```python
import uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    """Adds created_at and updated_at columns to any model."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDPrimaryKeyMixin:
    """Adds a UUID primary key column."""
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
```

### 6. Full PostgreSQL Schema

Every table is defined below with exact column names, SQL types, nullable flags, defaults,
constraints, indexes, and foreign keys. SQLAlchemy model code is provided for each.

All UUID primary keys use `uuid.uuid4` as default. All tables with timestamps use the
`TimestampMixin`. Foreign keys use `ON DELETE CASCADE` unless otherwise noted.

---

#### Table 1: `stocks`

Master list of tracked securities.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| ticker | VARCHAR(20) | NO | -- | UNIQUE, INDEX |
| name | VARCHAR(255) | NO | -- | -- |
| exchange | VARCHAR(50) | YES | NULL | -- |
| sector | VARCHAR(100) | YES | NULL | -- |
| industry | VARCHAR(100) | YES | NULL | -- |
| market_cap | BIGINT | YES | NULL | -- |
| currency | VARCHAR(10) | NO | 'USD' | -- |
| asset_type | VARCHAR(20) | NO | 'stock' | -- (stock, etf, crypto) |
| is_active | BOOLEAN | NO | true | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |
| updated_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `ix_stocks_ticker` (unique), `ix_stocks_sector`, `ix_stocks_asset_type`

```python
# backend/app/models/stock.py
import uuid
from sqlalchemy import BigInteger, Boolean, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Stock(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "stocks"

    ticker: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    exchange: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    market_cap: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, server_default="USD")
    asset_type: Mapped[str] = mapped_column(String(20), nullable=False, server_default="stock")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")

    __table_args__ = (
        Index("ix_stocks_asset_type", "asset_type"),
    )
```

---

#### Table 2: `prices`

OHLCV price data. One row per ticker per date per timeframe.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| stock_id | UUID | NO | -- | FK -> stocks.id ON DELETE CASCADE |
| date | DATE | NO | -- | -- |
| timeframe | VARCHAR(20) | NO | -- | -- (daily, 1h, 5m, 1m) |
| open | NUMERIC(14,4) | NO | -- | -- |
| high | NUMERIC(14,4) | NO | -- | -- |
| low | NUMERIC(14,4) | NO | -- | -- |
| close | NUMERIC(14,4) | NO | -- | -- |
| volume | BIGINT | NO | 0 | -- |
| adj_close | NUMERIC(14,4) | YES | NULL | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `uq_prices_stock_date_tf` (unique on stock_id + date + timeframe), `ix_prices_date`

```python
# backend/app/models/price.py
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class Price(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "prices"

    stock_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    timeframe: Mapped[str] = mapped_column(String(20), nullable=False)
    open: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    high: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    low: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    close: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    volume: Mapped[int] = mapped_column(BigInteger, nullable=False, server_default="0")
    adj_close: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("stock_id", "date", "timeframe", name="uq_prices_stock_date_tf"),
    )
```

---

#### Table 3: `indicators`

Computed technical indicator values.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| stock_id | UUID | NO | -- | FK -> stocks.id ON DELETE CASCADE |
| date | DATE | NO | -- | -- |
| timeframe | VARCHAR(20) | NO | -- | -- |
| indicator_name | VARCHAR(50) | NO | -- | -- (rsi_14, sma_50, macd, etc.) |
| value | NUMERIC(18,6) | NO | -- | -- |
| metadata_ | JSONB | YES | NULL | -- (extra params like period, etc.) |
| created_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `uq_indicators_stock_date_tf_name` (unique on stock_id + date + timeframe + indicator_name), `ix_indicators_indicator_name`

```python
# backend/app/models/indicator.py
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class Indicator(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "indicators"

    stock_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    timeframe: Mapped[str] = mapped_column(String(20), nullable=False)
    indicator_name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    value: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=False)
    metadata_: Mapped[dict[str, Any] | None] = mapped_column(
        "metadata", JSONB, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "stock_id", "date", "timeframe", "indicator_name",
            name="uq_indicators_stock_date_tf_name",
        ),
    )
```

---

#### Table 4: `fundamentals`

Quarterly/annual financial data per stock.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| stock_id | UUID | NO | -- | FK -> stocks.id ON DELETE CASCADE |
| period | VARCHAR(10) | NO | -- | -- (2024-Q1, 2024-FY) |
| period_end_date | DATE | NO | -- | -- |
| revenue | NUMERIC(18,2) | YES | NULL | -- |
| net_income | NUMERIC(18,2) | YES | NULL | -- |
| eps | NUMERIC(10,4) | YES | NULL | -- |
| pe_ratio | NUMERIC(10,4) | YES | NULL | -- |
| pb_ratio | NUMERIC(10,4) | YES | NULL | -- |
| debt_to_equity | NUMERIC(10,4) | YES | NULL | -- |
| current_ratio | NUMERIC(10,4) | YES | NULL | -- |
| roe | NUMERIC(10,4) | YES | NULL | -- (return on equity, decimal) |
| free_cash_flow | NUMERIC(18,2) | YES | NULL | -- |
| dividend_yield | NUMERIC(8,4) | YES | NULL | -- (decimal, e.g. 0.0325) |
| gross_margin | NUMERIC(8,4) | YES | NULL | -- |
| operating_margin | NUMERIC(8,4) | YES | NULL | -- |
| raw_data | JSONB | YES | NULL | -- (full API response stored) |
| created_at | TIMESTAMPTZ | NO | now() | -- |
| updated_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `uq_fundamentals_stock_period` (unique on stock_id + period)

```python
# backend/app/models/fundamental.py
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class Fundamental(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "fundamentals"

    stock_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False
    )
    period: Mapped[str] = mapped_column(String(10), nullable=False)
    period_end_date: Mapped[date] = mapped_column(Date, nullable=False)
    revenue: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    net_income: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    eps: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)
    pe_ratio: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)
    pb_ratio: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)
    debt_to_equity: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)
    current_ratio: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)
    roe: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)
    free_cash_flow: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    dividend_yield: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    gross_margin: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    operating_margin: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    raw_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    __table_args__ = (
        UniqueConstraint("stock_id", "period", name="uq_fundamentals_stock_period"),
    )
```

---

#### Table 5: `news`

News articles and their sentiment.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| stock_id | UUID | YES | NULL | FK -> stocks.id ON DELETE SET NULL |
| headline | VARCHAR(500) | NO | -- | -- |
| summary | TEXT | YES | NULL | -- |
| source | VARCHAR(100) | NO | -- | -- (finnhub, marketaux, rss) |
| source_url | VARCHAR(1000) | YES | NULL | -- |
| sentiment_score | NUMERIC(5,4) | YES | NULL | -- (-1.0000 to 1.0000) |
| sentiment_label | VARCHAR(20) | YES | NULL | -- (positive, negative, neutral) |
| published_at | TIMESTAMPTZ | NO | -- | -- |
| fetched_at | TIMESTAMPTZ | NO | now() | -- |
| raw_data | JSONB | YES | NULL | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `ix_news_stock_id`, `ix_news_published_at`, `ix_news_source`

```python
# backend/app/models/news.py
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class News(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "news"

    stock_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="SET NULL"), nullable=True, index=True
    )
    headline: Mapped[str] = mapped_column(String(500), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    source_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    sentiment_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), nullable=True)
    sentiment_label: Mapped[str | None] = mapped_column(String(20), nullable=True)
    published_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    raw_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
```

---

#### Table 6: `recommendations`

AI-generated trade recommendations.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| stock_id | UUID | NO | -- | FK -> stocks.id ON DELETE CASCADE |
| date | DATE | NO | -- | -- |
| horizon | VARCHAR(20) | NO | -- | -- (day, swing, long_term) |
| signal | VARCHAR(10) | NO | -- | -- (buy, sell, hold) |
| combined_score | NUMERIC(5,2) | NO | -- | -- (-100.00 to 100.00) |
| confidence | NUMERIC(3,2) | NO | -- | -- (0.00 to 1.00) |
| entry_price | NUMERIC(14,4) | YES | NULL | -- |
| stop_loss_price | NUMERIC(14,4) | YES | NULL | -- |
| take_profit_price | NUMERIC(14,4) | YES | NULL | -- |
| reasoning | TEXT | NO | -- | -- (LLM-generated explanation) |
| technical_score | NUMERIC(5,2) | YES | NULL | -- |
| fundamental_score | NUMERIC(5,2) | YES | NULL | -- |
| sentiment_score | NUMERIC(5,2) | YES | NULL | -- |
| risk_reward_ratio | NUMERIC(6,2) | YES | NULL | -- |
| is_active | BOOLEAN | NO | true | -- |
| expires_at | TIMESTAMPTZ | YES | NULL | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |
| updated_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `ix_recommendations_stock_id`, `ix_recommendations_date`, `ix_recommendations_signal`, `ix_recommendations_is_active`

```python
# backend/app/models/recommendation.py
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class Recommendation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "recommendations"

    stock_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    horizon: Mapped[str] = mapped_column(String(20), nullable=False)
    signal: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    combined_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    confidence: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False)
    entry_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    stop_loss_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    take_profit_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    technical_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    fundamental_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    sentiment_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    risk_reward_ratio: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true", index=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

---

#### Table 7: `portfolio`

Current open positions.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| stock_id | UUID | NO | -- | FK -> stocks.id ON DELETE CASCADE |
| recommendation_id | UUID | YES | NULL | FK -> recommendations.id ON DELETE SET NULL |
| shares | NUMERIC(14,4) | NO | -- | -- |
| entry_price | NUMERIC(14,4) | NO | -- | -- |
| current_price | NUMERIC(14,4) | YES | NULL | -- |
| entry_date | DATE | NO | -- | -- |
| horizon | VARCHAR(20) | NO | -- | -- (day, swing, long_term) |
| stop_loss | NUMERIC(14,4) | YES | NULL | -- |
| take_profit | NUMERIC(14,4) | YES | NULL | -- |
| unrealized_pnl | NUMERIC(14,4) | YES | NULL | -- |
| status | VARCHAR(20) | NO | 'open' | -- (open, closed, partially_closed) |
| closed_at | TIMESTAMPTZ | YES | NULL | -- |
| closed_price | NUMERIC(14,4) | YES | NULL | -- |
| realized_pnl | NUMERIC(14,4) | YES | NULL | -- |
| notes | TEXT | YES | NULL | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |
| updated_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `ix_portfolio_stock_id`, `ix_portfolio_status`, `ix_portfolio_entry_date`

```python
# backend/app/models/portfolio.py
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class Portfolio(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "portfolio"

    stock_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recommendation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True
    )
    shares: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    entry_price: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    current_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    horizon: Mapped[str] = mapped_column(String(20), nullable=False)
    stop_loss: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    take_profit: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    unrealized_pnl: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="open", index=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    realized_pnl: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
```

---

#### Table 8: `orders`

Orders submitted to IBKR (or recorded manually).

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| recommendation_id | UUID | YES | NULL | FK -> recommendations.id ON DELETE SET NULL |
| stock_id | UUID | NO | -- | FK -> stocks.id ON DELETE CASCADE |
| ibkr_order_id | INTEGER | YES | NULL | -- (IBKR's internal order ID) |
| order_type | VARCHAR(20) | NO | -- | -- (market, limit, stop, stop_limit) |
| side | VARCHAR(10) | NO | -- | -- (buy, sell) |
| quantity | NUMERIC(14,4) | NO | -- | -- |
| limit_price | NUMERIC(14,4) | YES | NULL | -- |
| stop_price | NUMERIC(14,4) | YES | NULL | -- |
| filled_price | NUMERIC(14,4) | YES | NULL | -- |
| filled_quantity | NUMERIC(14,4) | YES | NULL | -- |
| status | VARCHAR(20) | NO | 'pending' | -- (pending, submitted, filled, partially_filled, cancelled, rejected) |
| bracket_parent_id | UUID | YES | NULL | FK -> orders.id ON DELETE SET NULL |
| bracket_role | VARCHAR(20) | YES | NULL | -- (entry, stop_loss, take_profit) |
| trading_mode | VARCHAR(10) | NO | -- | -- (manual, paper, live) |
| submitted_at | TIMESTAMPTZ | YES | NULL | -- |
| filled_at | TIMESTAMPTZ | YES | NULL | -- |
| cancelled_at | TIMESTAMPTZ | YES | NULL | -- |
| error_message | TEXT | YES | NULL | -- |
| raw_response | JSONB | YES | NULL | -- (IBKR API response) |
| created_at | TIMESTAMPTZ | NO | now() | -- |
| updated_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `ix_orders_stock_id`, `ix_orders_status`, `ix_orders_ibkr_order_id`, `ix_orders_recommendation_id`, `ix_orders_bracket_parent_id`

```python
# backend/app/models/order.py
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class Order(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "orders"

    recommendation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recommendations.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )
    stock_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ibkr_order_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    order_type: Mapped[str] = mapped_column(String(20), nullable=False)
    side: Mapped[str] = mapped_column(String(10), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 4), nullable=False)
    limit_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    stop_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    filled_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    filled_quantity: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="pending", index=True)
    bracket_parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )
    bracket_role: Mapped[str | None] = mapped_column(String(20), nullable=True)
    trading_mode: Mapped[str] = mapped_column(String(10), nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    filled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_response: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
```

---

#### Table 9: `agent_logs`

Logs every AI agent invocation (input, output, cost).

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| stock_id | UUID | YES | NULL | FK -> stocks.id ON DELETE SET NULL |
| agent_type | VARCHAR(50) | NO | -- | -- (cio, risk_manager, portfolio_manager, research_director, performance_analyst, technical_analyst, fundamental_analyst, sentiment_analyst, scout) |
| run_id | UUID | YES | NULL | -- (groups related agent calls in one session) |
| input_summary | TEXT | NO | -- | -- |
| output | TEXT | NO | -- | -- |
| model | VARCHAR(50) | YES | NULL | -- (claude-sonnet-4-20250514, etc.) |
| input_tokens | INTEGER | YES | NULL | -- |
| output_tokens | INTEGER | YES | NULL | -- |
| duration_ms | INTEGER | YES | NULL | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `ix_agent_logs_agent_type`, `ix_agent_logs_stock_id`, `ix_agent_logs_run_id`, `ix_agent_logs_created_at`

```python
# backend/app/models/agent_log.py
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class AgentLog(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "agent_logs"

    stock_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )
    agent_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    run_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    input_summary: Mapped[str] = mapped_column(Text, nullable=False)
    output: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[str | None] = mapped_column(String(50), nullable=True)
    input_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    output_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
```

---

#### Table 10: `watchlists`

Stocks being actively watched/screened.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| stock_id | UUID | NO | -- | FK -> stocks.id ON DELETE CASCADE |
| source | VARCHAR(50) | NO | -- | -- (scout, manual, screener) |
| screening_criteria | TEXT | YES | NULL | -- |
| priority | VARCHAR(10) | NO | 'medium' | -- (high, medium, low) |
| notes | TEXT | YES | NULL | -- |
| is_active | BOOLEAN | NO | true | -- |
| added_at | TIMESTAMPTZ | NO | now() | -- |
| expires_at | TIMESTAMPTZ | YES | NULL | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |
| updated_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `ix_watchlists_stock_id`, `ix_watchlists_is_active`

```python
# backend/app/models/watchlist.py
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class Watchlist(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "watchlists"

    stock_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    screening_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(10), nullable=False, server_default="medium")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true", index=True)
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

---

#### Table 11: `market_regime`

CIO agent's daily market assessment.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| date | DATE | NO | -- | UNIQUE |
| regime | VARCHAR(30) | NO | -- | -- (bull, bear, sideways, volatile, crisis) |
| stance | VARCHAR(20) | NO | -- | -- (aggressive, moderate, defensive, cash) |
| sector_biases | JSONB | YES | NULL | -- ({"technology": "overweight", "energy": "underweight"}) |
| reasoning | TEXT | NO | -- | -- |
| confidence | NUMERIC(3,2) | NO | -- | -- (0.00 to 1.00) |
| key_factors | JSONB | YES | NULL | -- (["fed_meeting", "earnings_season"]) |
| created_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `uq_market_regime_date` (unique on date)

```python
# backend/app/models/market_regime.py
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, DateTime, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class MarketRegime(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "market_regime"

    date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    regime: Mapped[str] = mapped_column(String(30), nullable=False)
    stance: Mapped[str] = mapped_column(String(20), nullable=False)
    sector_biases: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False)
    key_factors: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
```

---

#### Table 12: `risk_reports`

Risk Manager agent's daily portfolio risk assessment.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| date | DATE | NO | -- | UNIQUE |
| total_exposure | NUMERIC(14,2) | NO | -- | -- (dollar amount) |
| total_positions | INTEGER | NO | 0 | -- |
| max_drawdown_pct | NUMERIC(6,4) | YES | NULL | -- |
| daily_pnl | NUMERIC(14,2) | YES | NULL | -- |
| sector_breakdown | JSONB | YES | NULL | -- ({"tech": 0.45, "finance": 0.20}) |
| concentration_warnings | JSONB | YES | NULL | -- ([{"ticker": "AAPL", "pct": 0.35}]) |
| risk_score | NUMERIC(5,2) | YES | NULL | -- (0-100) |
| warnings | JSONB | YES | NULL | -- (["high_tech_concentration", "stop_losses_too_tight"]) |
| reasoning | TEXT | NO | -- | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `uq_risk_reports_date` (unique on date)

```python
# backend/app/models/risk_report.py
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class RiskReport(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "risk_reports"

    date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    total_exposure: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_positions: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    max_drawdown_pct: Mapped[Decimal | None] = mapped_column(Numeric(6, 4), nullable=True)
    daily_pnl: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    sector_breakdown: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    concentration_warnings: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB, nullable=True)
    risk_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    warnings: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
```

---

#### Table 13: `trade_outcomes`

Actual result of each recommendation after the trade closes.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| recommendation_id | UUID | NO | -- | FK -> recommendations.id ON DELETE CASCADE, UNIQUE |
| portfolio_id | UUID | YES | NULL | FK -> portfolio.id ON DELETE SET NULL |
| actual_return_pct | NUMERIC(8,4) | YES | NULL | -- |
| actual_return_amount | NUMERIC(14,2) | YES | NULL | -- |
| hit_target | BOOLEAN | YES | NULL | -- |
| hit_stop | BOOLEAN | YES | NULL | -- |
| exit_reason | VARCHAR(30) | YES | NULL | -- (target_hit, stop_hit, manual_close, expired, signal_change) |
| duration_days | INTEGER | YES | NULL | -- |
| entry_date | DATE | YES | NULL | -- |
| exit_date | DATE | YES | NULL | -- |
| entry_price | NUMERIC(14,4) | YES | NULL | -- |
| exit_price | NUMERIC(14,4) | YES | NULL | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |
| updated_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `uq_trade_outcomes_recommendation` (unique on recommendation_id), `ix_trade_outcomes_exit_date`

```python
# backend/app/models/trade_outcome.py
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class TradeOutcome(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "trade_outcomes"

    recommendation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recommendations.id", ondelete="CASCADE"),
        nullable=False, unique=True,
    )
    portfolio_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portfolio.id", ondelete="SET NULL"), nullable=True
    )
    actual_return_pct: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    actual_return_amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    hit_target: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    hit_stop: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    exit_reason: Mapped[str | None] = mapped_column(String(30), nullable=True)
    duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    entry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    exit_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    entry_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    exit_price: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
```

---

#### Table 14: `performance_reports`

Periodic system performance summaries from the Performance Analyst agent.

| Column | SQL Type | Nullable | Default | Constraints |
|--------|----------|----------|---------|-------------|
| id | UUID | NO | uuid4 | PRIMARY KEY |
| period_start | DATE | NO | -- | -- |
| period_end | DATE | NO | -- | -- |
| period_type | VARCHAR(20) | NO | -- | -- (daily, weekly, monthly) |
| portfolio_return_pct | NUMERIC(8,4) | YES | NULL | -- |
| benchmark_return_pct | NUMERIC(8,4) | YES | NULL | -- |
| benchmark_ticker | VARCHAR(20) | NO | 'SPY' | -- |
| alpha | NUMERIC(8,4) | YES | NULL | -- |
| total_trades | INTEGER | NO | 0 | -- |
| winning_trades | INTEGER | NO | 0 | -- |
| losing_trades | INTEGER | NO | 0 | -- |
| win_rate | NUMERIC(5,4) | YES | NULL | -- (0.0000 to 1.0000) |
| avg_win_pct | NUMERIC(8,4) | YES | NULL | -- |
| avg_loss_pct | NUMERIC(8,4) | YES | NULL | -- |
| profit_factor | NUMERIC(8,4) | YES | NULL | -- |
| sharpe_ratio | NUMERIC(8,4) | YES | NULL | -- |
| max_drawdown_pct | NUMERIC(8,4) | YES | NULL | -- |
| agent_accuracy | JSONB | YES | NULL | -- ({"technical": 0.65, "fundamental": 0.72, ...}) |
| proposals | JSONB | YES | NULL | -- (["increase_stop_distance", "reduce_tech_weight"]) |
| reasoning | TEXT | YES | NULL | -- |
| created_at | TIMESTAMPTZ | NO | now() | -- |

**Indexes:** `uq_performance_reports_period` (unique on period_start + period_end + period_type), `ix_performance_reports_period_type`

```python
# backend/app/models/performance_report.py
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, DateTime, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class PerformanceReport(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "performance_reports"

    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    period_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    portfolio_return_pct: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    benchmark_return_pct: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    benchmark_ticker: Mapped[str] = mapped_column(String(20), nullable=False, server_default="SPY")
    alpha: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    total_trades: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    winning_trades: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    losing_trades: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    win_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), nullable=True)
    avg_win_pct: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    avg_loss_pct: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    profit_factor: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    sharpe_ratio: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    max_drawdown_pct: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    agent_accuracy: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    proposals: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "period_start", "period_end", "period_type",
            name="uq_performance_reports_period",
        ),
    )
```

---

#### Models `__init__.py`

**`backend/app/models/__init__.py`** -- imports all models so Alembic can discover them:

```python
from app.models.base import Base
from app.models.stock import Stock
from app.models.price import Price
from app.models.indicator import Indicator
from app.models.fundamental import Fundamental
from app.models.news import News
from app.models.recommendation import Recommendation
from app.models.portfolio import Portfolio
from app.models.order import Order
from app.models.agent_log import AgentLog
from app.models.watchlist import Watchlist
from app.models.market_regime import MarketRegime
from app.models.risk_report import RiskReport
from app.models.trade_outcome import TradeOutcome
from app.models.performance_report import PerformanceReport

__all__ = [
    "Base",
    "Stock",
    "Price",
    "Indicator",
    "Fundamental",
    "News",
    "Recommendation",
    "Portfolio",
    "Order",
    "AgentLog",
    "Watchlist",
    "MarketRegime",
    "RiskReport",
    "TradeOutcome",
    "PerformanceReport",
]
```

### 7. Alembic Setup

**`backend/alembic.ini`:**

```ini
[alembic]
script_location = migrations
prepend_sys_path = .

# This is overridden in migrations/env.py to use settings.database_url
sqlalchemy.url = postgresql+asyncpg://wealth_gainer:wealth_gainer@localhost:5432/wealth_gainer

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

**`backend/migrations/env.py`** (async-aware):

```python
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.config import settings
from app.models import Base  # noqa: F401 — triggers all model imports

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

**`backend/migrations/script.py.mako`:**

```mako
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
```

**Initial migration generation:**

The developer should NOT hand-write the initial migration. Instead:

```bash
cd backend
poetry run alembic revision --autogenerate -m "001 initial schema"
```

This will auto-generate the migration from all models imported in `app/models/__init__.py`.
The developer must review the generated migration and verify it contains all 14 tables
before running:

```bash
poetry run alembic upgrade head
```

To roll back:

```bash
poetry run alembic downgrade -1
```

### 8. .gitignore

**`/Users/user/Desktop/study/wealth-gainer/.gitignore`:**

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
*.egg-info/
dist/
build/
*.egg

# Virtual environments
.venv/
venv/
env/

# IDE
.idea/
.vscode/
*.swp
*.swo
*~
.DS_Store

# Environment / secrets
.env
*.env.local

# Poetry
poetry.lock

# Database
*.db
*.sqlite3

# Logs
*.log

# Testing
.pytest_cache/
htmlcov/
.coverage

# Alembic (don't ignore migrations/versions -- those are committed)

# OS
Thumbs.db
```

**Note:** `poetry.lock` is listed above but this is a preference choice. If the developer
prefers reproducible builds, remove `poetry.lock` from `.gitignore` and commit it. For a
solo project, either approach works.

### 9. PostgreSQL Setup (Local)

Before running the backend, the developer must create the database and user:

```bash
# Option A: via Homebrew PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Create user and database
psql postgres -c "CREATE USER wealth_gainer WITH PASSWORD 'wealth_gainer';"
psql postgres -c "CREATE DATABASE wealth_gainer OWNER wealth_gainer;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE wealth_gainer TO wealth_gainer;"
```

```bash
# Option B: via Docker (one-liner)
docker run -d \
  --name wealth-gainer-db \
  -e POSTGRES_USER=wealth_gainer \
  -e POSTGRES_PASSWORD=wealth_gainer \
  -e POSTGRES_DB=wealth_gainer \
  -p 5432:5432 \
  postgres:16-alpine
```

### 10. Running the Application

```bash
cd backend
poetry install
cp .env.example .env  # then edit .env if needed
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify: `curl http://localhost:8000/api/v1/health` should return:

```json
{"status": "ok", "version": "0.1.0"}
```

### 11. Structured Logging Configuration

Add to `backend/app/main.py` (before app creation):

```python
import structlog

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer()  # Switch to JSONRenderer() for production
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        getattr(structlog, settings.log_level.upper(), structlog.INFO) if hasattr(structlog, settings.log_level.upper()) else 20
    ),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)
```

---

## Tasks (ordered)

All tasks are backend-only for this feature.

1. [ ] **[BE] Initialize Poetry project** -- Create `backend/` directory, run `poetry init`, add all runtime and dev dependencies as specified in Section 2. Create `pyproject.toml` with the exact contents specified.

2. [ ] **[BE] Create project directory structure** -- Create all directories and `__init__.py` files: `app/`, `app/models/`, `app/routes/`, `app/schemas/`, `migrations/`, `migrations/versions/`. Every package directory gets an `__init__.py`.

3. [ ] **[BE] Create .env.example and .gitignore** -- Create `backend/.env.example` with all config variables (Section 3). Create root `.gitignore` with all patterns (Section 8). Copy `.env.example` to `.env` for local use.

4. [ ] **[BE] Implement config.py** -- Create `backend/app/config.py` with the Pydantic `Settings` class that reads from `.env`. All fields typed, all defaults set (Section 3).

5. [ ] **[BE] Implement database.py** -- Create `backend/app/database.py` with async SQLAlchemy engine, session factory, and `get_session` dependency (Section 4).

6. [ ] **[BE] Implement model base classes** -- Create `backend/app/models/base.py` with `Base`, `TimestampMixin`, and `UUIDPrimaryKeyMixin` (Section 5).

7. [ ] **[BE] Implement all 14 SQLAlchemy models** -- Create one file per model in `backend/app/models/`. Each model must match the table definitions in Section 6 exactly. Create `backend/app/models/__init__.py` that imports all models.

8. [ ] **[BE] Set up Alembic** -- Create `backend/alembic.ini` and `backend/migrations/env.py` (async-aware) as specified in Section 7. Create `backend/migrations/script.py.mako`.

9. [ ] **[BE] Generate and verify initial migration** -- Run `alembic revision --autogenerate`. Review the generated migration to ensure all 14 tables, all columns, all constraints, and all indexes are present. Fix any issues.

10. [ ] **[BE] Set up PostgreSQL locally** -- Create the `wealth_gainer` database and user (Section 9). Run `alembic upgrade head`. Verify all 14 tables exist with `\dt` in psql.

11. [ ] **[BE] Implement health check endpoint** -- Create `backend/app/schemas/health.py` and `backend/app/routes/health.py` (Section 4). Wire the router into `main.py`.

12. [ ] **[BE] Implement FastAPI main.py with middleware** -- Create `backend/app/main.py` with lifespan handler, CORS middleware, structured logging setup, and router inclusion (Sections 4, 11).

13. [ ] **[BE] Configure structured logging** -- Set up structlog in `main.py` as specified in Section 11. Verify log output includes timestamps and log levels.

14. [ ] **[BE] End-to-end verification** -- Start the server with `uvicorn app.main:app --reload`. Hit `GET /api/v1/health`. Verify 200 response with `{"status": "ok", "version": "0.1.0"}`. Check logs show startup message. Verify DB connection works (no errors on startup).

15. [ ] **[BE] Run Alembic downgrade test** -- Run `alembic downgrade base` to verify all tables are dropped cleanly, then `alembic upgrade head` again. This confirms reversibility.

---

## Acceptance Criteria

- [ ] AC1: `poetry install` in `backend/` succeeds with no errors
- [ ] AC2: `alembic upgrade head` creates all 14 tables in PostgreSQL
- [ ] AC3: `alembic downgrade base` drops all 14 tables cleanly
- [ ] AC4: `alembic upgrade head` after downgrade re-creates everything identically
- [ ] AC5: `uvicorn app.main:app` starts without errors on port 8000
- [ ] AC6: `GET /api/v1/health` returns `{"status": "ok", "version": "0.1.0"}` with HTTP 200
- [ ] AC7: CORS headers are present in responses (Access-Control-Allow-Origin)
- [ ] AC8: Structured log output appears on server startup (with timestamp and level)
- [ ] AC9: `.env` is git-ignored; `.env.example` is committed
- [ ] AC10: All 14 tables have correct columns, types, constraints, and indexes (verified via `\d+ table_name` in psql)
- [ ] AC11: All foreign keys reference the correct parent tables with correct ON DELETE behavior
- [ ] AC12: All unique constraints prevent duplicate inserts (tested manually or via quick script)
- [ ] AC13: `ruff check app/` passes with zero warnings

---

## Edge Cases

- **PostgreSQL not running:** The app should fail fast on startup with a clear error message ("Cannot connect to database at ..."), not hang or retry silently. The `lifespan` handler does not explicitly test the connection on startup in this minimal version, but SQLAlchemy will raise `ConnectionRefusedError` on the first query. Consider adding an explicit connection test in a future iteration.

- **Missing .env file:** Pydantic Settings will fall back to defaults defined in `config.py`. The app will still start (with default database URL). This is acceptable for local development.

- **Wrong database credentials:** `asyncpg.InvalidPasswordError` will surface on first DB access. The error is clear and requires no special handling beyond fixing `.env`.

- **Port 8000 already in use:** Uvicorn will raise `OSError: [Errno 48] Address already in use`. The developer must kill the conflicting process or use `--port 8001`.

- **Alembic autogenerate misses something:** The developer MUST manually review the generated migration. Autogenerate can miss: index names, check constraints, custom server_defaults. The spec provides exact expected schema for comparison.

- **NUMERIC precision overflow:** Columns like `combined_score NUMERIC(5,2)` allow values from -999.99 to 999.99. The spec uses -100 to 100 for scores. If a future agent produces a score outside this range, the insert will fail with a PostgreSQL overflow error. The application layer should validate ranges before inserting.

- **UUID collision:** Astronomically unlikely with uuid4 but technically possible. PostgreSQL's UNIQUE constraint on primary keys would catch this with a `UniqueViolation` error.

- **Concurrent Alembic migrations:** Running `alembic upgrade head` simultaneously from two terminals can cause lock contention. Alembic uses an `alembic_version` table for locking, but for a single-developer project this is unlikely to occur.

- **Large JSONB columns:** Columns like `raw_data`, `sector_biases`, `agent_accuracy` store arbitrary JSON. There is no size limit enforced at the schema level. For this foundation spec, this is acceptable. Future specs may add CHECK constraints or application-level validation if data bloat becomes a concern.

---

## Out of Scope

- **Business logic** -- no services, repositories, or data processing. Just the skeleton.
- **Authentication/authorization** -- local-only, single user, not needed.
- **Docker Compose** -- will be added in a future spec when more services are needed.
- **Test files** -- no unit/integration tests in this spec (the directory structure is ready for them).
- **CI/CD pipeline** -- local only for now.
- **Data seeding** -- no initial data loaded. Tables start empty.
- **WebSocket support** -- will be added when the dashboard needs real-time updates.
- **Additional API endpoints** -- only health check. All other endpoints come in future specs.
