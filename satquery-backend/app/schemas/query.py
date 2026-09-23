from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, List
from uuid import UUID
from datetime import datetime


class QueryCreate(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    input_type: Literal["single", "bitemporal", "optical_sar"]


class QueryResponse(BaseModel):
    query_id: UUID
    answer: str
    evidence_image_url: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    detected_task: Literal["vqa", "change_detection", "grounding", "fusion"]
    trace: List[Dict[str, str]]


class QueryHistoryItem(BaseModel):
    id: UUID
    question: str
    input_type: str
    detected_task: Optional[str]
    created_at: datetime


class HealthResponse(BaseModel):
    status: str = "ok"