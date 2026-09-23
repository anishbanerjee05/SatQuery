from app.agent.state import AgentState
from app.services.openrouter_client import openrouter_client
from app.services.storage import storage_service
from app.services.image_utils import (
    load_image,
    compute_diff_heatmap,
    image_to_bytes,
    image_to_base64,
)
import asyncio


CHANGE_DETECTION_PROMPT = """You are a satellite imagery change detection analyst.
You are given two images from different time periods (T1 and T2) and a user's question about changes.
A naive pixel-difference heatmap has been computed and overlaid on T2 (highlighted in red/yellow).
This heatmap shows raw pixel differences but may include noise, seasonal variations, or misalignment artifacts.

Your task: Describe the likely real-world changes between T1 and T2, using the heatmap as a hint.
Focus on semantic changes (new construction, deforestation, flooding, crop harvest, urban expansion, etc.)
rather than pixel-level noise. Be specific about location and nature of changes."""


async def change_detection_node(state: AgentState) -> AgentState:
    question = state["question"]
    t1_url = state["preprocessed"]["t1"]["url"]
    t2_url = state["preprocessed"]["t2"]["url"]

    t1_bytes = await storage_service.download_image(t1_url)
    t2_bytes = await storage_service.download_image(t2_url)

    t1_img = load_image(t1_bytes)
    t2_img = load_image(t2_bytes)

    diff_overlay = compute_diff_heatmap(t1_img, t2_img)
    diff_bytes = image_to_bytes(diff_overlay)
    diff_url = await storage_service.upload_image(diff_bytes, "image/png", "evidence")

    t1_b64 = image_to_base64(t1_img)
    t2_b64 = image_to_base64(t2_img)
    diff_b64 = image_to_base64(diff_overlay)

    messages = [
        {"role": "system", "content": CHANGE_DETECTION_PROMPT},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": f"Question: {question}\n\nA pixel-difference heatmap (red/yellow overlay on T2) highlights regions of raw change. Describe the likely real-world changes."},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{t1_b64}"}},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{t2_b64}"}},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{diff_b64}"}},
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
    trace.append({"node": "change_detection", "summary": "Computed pixel-diff heatmap and described semantic changes"})

    return {
        **state,
        "specialist_output": {"answer": answer, "diff_heatmap_url": diff_url},
        "final_answer": answer,
        "evidence_image_url": diff_url,
        "trace": trace,
    }