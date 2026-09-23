import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlmodel import Field, SQLModel, Column, JSON


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, nullable=False)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)


class Query(SQLModel, table=True):
    __tablename__ = "queries"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    question: str = Field(nullable=False)
    input_type: str = Field(nullable=False)
    image_urls: Dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))
    detected_task: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)


class Result(SQLModel, table=True):
    __tablename__ = "results"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    query_id: uuid.UUID = Field(foreign_key="queries.id", nullable=False)
    answer_text: str = Field(nullable=False)
    evidence_image_url: Optional[str] = Field(default=None)
    confidence_score: Optional[float] = Field(default=None)
    execution_trace: List[Dict[str, Any]] = Field(sa_column=Column(JSON, nullable=False, default=[]))
    created_at: datetime = Field(default_factory=utc_now, nullable=False)