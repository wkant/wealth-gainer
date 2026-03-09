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
