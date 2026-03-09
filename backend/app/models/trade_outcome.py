import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


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
