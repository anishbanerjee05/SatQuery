from app.agent.state import AgentState
from app.services.openrouter_client import openrouter_client
from app.services.storage import storage_service
from app.services.image_utils import (
    load_image,
    create_fusion_composite,
    image_to_bytes,
    image_to_base64,
)
import asyncio


FUSION_PROMPT = """You are a multi-modal satellite imagery analyst.
You are given an optical image and a SAR (Synthetic Aperture Radar) image of the same area,
plus a side-by-side composite. The optical image shows visual appearance (color, texture).
The SAR image shows surface roughness, moisture, and structure (bright = rough/wet, smooth = dark/water).

Your task: Answer the user's question by reasoning across BOTH modalities.
- Optical: good for land cover classification, vegetation health, water bodies, urban areas
- SAR: good for flood detection (water appears dark), soil moisture, surface deformation, 
  seeing through clouds/smoke, ship detection, crop structure

Combine insights from both to give a more robust answer than either alone."""


async def fusion_node(state: AgentState) -> AgentState:
    question = state["question"]
    optical_url = state["preprocessed"]["optical"]["url"]
    sar_url = state["preprocessed"]["sar"]["url"]

    optical_bytes = await storage_service.download_image(optical_url)
    sar_bytes = await storage_service.download_image(sar_url)

    optical_img = load_image(optical_bytes)
    sar_img = load_image(sar_bytes)

    composite = create_fusion_composite(optical_img, sar_img)
    composite_bytes = image_to_bytes(composite)
    composite_url = await storage_service.upload_image(composite_bytes, "image/png", "evidence")

    optical_b64 = image_to_base64(optical_img)
    sar_b64 = image_to_base64(sar_img)
    composite_b64 = image_to_base64(composite)

    messages = [
        {"role": "system", "content": FUSION_PROMPT},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": question},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{optical_b64}"}},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{sar_b64}"}},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{composite_b64}"}},
            ],
        },
    ]

    answer = await openrouter_client.chat_with_fallback(
        messages=messages,
        use_vision=True,
        temperature=0.2,
        max_tokens=1500,
    )

    trace = state.get("trace", [])
    trace.append({"node": "fusion", "summary": "Reasoned across optical + SAR modalities using side-by-side composite"})

    return {
        **state,
        "specialist_output": {"answer": answer, "composite_url": composite_url},
        "final_answer": answer,
        "evidence_image_url": composite_url,
        "trace": trace,
    }