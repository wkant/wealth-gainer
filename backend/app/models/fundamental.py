import uuid
from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


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
