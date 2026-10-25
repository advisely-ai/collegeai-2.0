from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Profile(Base):
    """Single-row profile. Auth is not built yet, so every request uses the row id 'default'."""

    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    grade: Mapped[str | None] = mapped_column(String(16))
    goals: Mapped[list[str]] = mapped_column(JSON, default=list)
    gpa: Mapped[float | None] = mapped_column(Float)
    no_gpa: Mapped[bool] = mapped_column(Boolean, default=False)
    parent_name: Mapped[str | None] = mapped_column(String(120))
    parent_email: Mapped[str | None] = mapped_column(String(254))
    parent_invited: Mapped[bool] = mapped_column(Boolean, default=False)
    onboarded: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    prompt_key: Mapped[str] = mapped_column(String(32))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Permission(Base):
    __tablename__ = "permissions"

    key: Mapped[str] = mapped_column(String(32), primary_key=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)


class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actor: Mapped[str] = mapped_column(String(32))
    action: Mapped[str] = mapped_column(String(160))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
