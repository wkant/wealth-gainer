import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


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
