from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, DateTime, Integer, Numeric, Text, func
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
