import io
import uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List, Dict, Optional

from app.db.session import get_session
from app.db.models import Query, Result, User
from app.schemas.query import QueryCreate, QueryResponse, QueryHistoryItem, HealthResponse
from app.agent.graph import graph
from app.services.storage import storage_service


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse()


async def get_or_create_anonymous_user(session: AsyncSession) -> uuid.UUID:
    result = await session.execute(select(User).where(User.email == "anonymous@satquery.ai"))
    user = result.scalar_one_or_none()
    if user:
        return user.id
    user = User(email="anonymous@satquery.ai")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user.id


@router.post("/query", response_model=QueryResponse)
async def create_query(
    question: str = Form(...),
    input_type: str = Form("single"),
    image: Optional[UploadFile] = File(None),
    image_single: Optional[UploadFile] = File(None),
    image_t1: Optional[UploadFile] = File(None),
    image_t2: Optional[UploadFile] = File(None),
    image_optical: Optional[UploadFile] = File(None),
    image_sar: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
):
    # Support alias 'image' for 'image_single'
    if not image_single and image:
        image_single = image

    # Helper to generate a fallback synthetic satellite scene if none uploaded
    async def get_synthetic_scene(name: str, color: tuple) -> str:
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (512, 512), color)
        draw = ImageDraw.Draw(img)
        # Draw mock satellite grid lines
        for step in range(64, 512, 64):
            draw.line([(step, 0), (step, 512)], fill=(40, 50, 70), width=1)
            draw.line([(0, step), (512, step)], fill=(40, 50, 70), width=1)
        draw.text((20, 20), f"SATQUERY SYNTHETIC SCENE: {name.upper()}", fill=(200, 220, 255))
        draw.text((20, 40), "LAT: 37.7749 N | LON: 122.4194 W", fill=(140, 160, 190))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return await storage_service.upload_image(buf.getvalue(), "image/png", "synthetic")

    image_urls = {}

    if input_type == "single":
        if image_single:
            image_url = await storage_service.upload_image(
                await image_single.read(), image_single.content_type or "image/png"
            )
        else:
            image_url = await get_synthetic_scene("Optical-Single", (24, 30, 42))
        image_urls = {"single": image_url}
    elif input_type == "bitemporal":
        if image_t1 and image_t2:
            t1_url = await storage_service.upload_image(await image_t1.read(), image_t1.content_type or "image/png")
            t2_url = await storage_service.upload_image(await image_t2.read(), image_t2.content_type or "image/png")
        else:
            t1_url = await get_synthetic_scene("T1-PrePass", (20, 28, 40))
            t2_url = await get_synthetic_scene("T2-PostPass", (28, 38, 55))
        image_urls = {"t1": t1_url, "t2": t2_url}
    elif input_type == "optical_sar":
        if image_optical and image_sar:
            opt_url = await storage_service.upload_image(await image_optical.read(), image_optical.content_type or "image/png")
            sar_url = await storage_service.upload_image(await image_sar.read(), image_sar.content_type or "image/png")
        else:
            opt_url = await get_synthetic_scene("Optical-RGB", (25, 35, 50))
            sar_url = await get_synthetic_scene("SAR-C-Band", (15, 18, 25))
        image_urls = {"optical": opt_url, "sar": sar_url}
    else:
        # Default fallback to single
        input_type = "single"
        image_url = await get_synthetic_scene("Optical-Default", (24, 30, 42))
        image_urls = {"single": image_url}


    user_id = await get_or_create_anonymous_user(session)

    query = Query(
        user_id=user_id,
        question=question,
        input_type=input_type,
        image_urls=image_urls,
    )
    session.add(query)
    await session.commit()
    await session.refresh(query)

    initial_state = {
        "question": question,
        "input_type": input_type,
        "image_urls": image_urls,
        "detected_task": None,
        "preprocessed": None,
        "specialist_output": None,
        "confidence": None,
        "evidence_image_url": None,
        "trace": [],
        "final_answer": None,
    }

    result_state = await graph.ainvoke(initial_state)

    result = Result(
        query_id=query.id,
        answer_text=result_state.get("final_answer", ""),
        evidence_image_url=result_state.get("evidence_image_url"),
        confidence_score=result_state.get("confidence"),
        execution_trace=result_state.get("trace", []),
    )
    session.add(result)

    query.detected_task = result_state.get("detected_task")
    await session.commit()

    return QueryResponse(
        query_id=query.id,
        answer=result_state.get("final_answer", ""),
        evidence_image_url=result_state.get("evidence_image_url"),
        confidence=result_state.get("confidence"),
        detected_task=result_state.get("detected_task", "vqa"),
        trace=result_state.get("trace", []),
    )


@router.get("/query/{query_id}", response_model=QueryResponse)
async def get_query(query_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    query_result = await session.execute(select(Query).where(Query.id == query_id))
    query = query_result.scalar_one_or_none()
    if not query:
        raise HTTPException(404, "Query not found")

    result_result = await session.execute(select(Result).where(Result.query_id == query_id))
    result = result_result.scalar_one_or_none()
    if not result:
        raise HTTPException(404, "Result not found")

    return QueryResponse(
        query_id=query.id,
        answer=result.answer_text,
        evidence_image_url=result.evidence_image_url,
        confidence=result.confidence_score,
        detected_task=query.detected_task or "vqa",
        trace=result.execution_trace,
    )


@router.get("/queries", response_model=List[QueryHistoryItem])
async def list_queries(limit: int = 20, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Query).order_by(Query.created_at.desc()).limit(limit)
    )
    queries = result.scalars().all()
    return [
        QueryHistoryItem(
            id=q.id,
            question=q.question,
            input_type=q.input_type,
            detected_task=q.detected_task,
            created_at=q.created_at,
        )
        for q in queries
    ]