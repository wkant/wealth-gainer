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
