import json
from app.agent.state import AgentState
from app.services.openrouter_client import openrouter_client
from app.services.storage import storage_service
from app.services.image_utils import load_image, draw_bounding_box, image_to_bytes, image_to_base64


GROUNDING_PROMPT = """You are a satellite imagery object localization assistant.
Given an image and a question asking to locate something, return the answer AND a bounding box in normalized coordinates [x0, y0, x1, y1] where each value is 0-1.
The bounding box should tightly enclose the object/region of interest.
Return ONLY a JSON object with keys: "answer" (string) and "bbox" (array of 4 floats).
Example: {"answer": "The reservoir is in the north-east quadrant", "bbox": [0.6, 0.1, 0.9, 0.4]}"""


async def grounding_node(state: AgentState) -> AgentState:
    question = state["question"]
    image_url = state["preprocessed"]["single"]["url"]

    image_bytes = await storage_service.download_image(image_url)
    image = load_image(image_bytes)
    image_b64 = image_to_base64(image)

    messages = [
        {"role": "system", "content": GROUNDING_PROMPT},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": question},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
            ],
        },
    ]

    response = await openrouter_client.chat_with_fallback(
        messages=messages,
        use_vision=True,
        temperature=0.1,
        max_tokens=500,
        response_format={"type": "json_object"},
    )

    try:
        result = json.loads(response)
        answer = result.get("answer", "")
        bbox = result.get("bbox", [0.0, 0.0, 1.0, 1.0])
        bbox = [max(0.0, min(1.0, float(v))) for v in bbox]
    except (json.JSONDecodeError, KeyError, TypeError):
        answer = "Could not locate the requested object in the image."
        bbox = [0.0, 0.0, 1.0, 1.0]

    overlay_img = draw_bounding_box(image.copy(), tuple(bbox))
    overlay_bytes = image_to_bytes(overlay_img)
    overlay_url = await storage_service.upload_image(overlay_bytes, "image/png", "evidence")

    trace = state.get("trace", [])
    trace.append({"node": "grounding", "summary": f"Localized object with bbox {bbox}"})

    return {
        **state,
        "specialist_output": {"answer": answer, "bbox": bbox, "overlay_url": overlay_url},
        "final_answer": answer,
        "evidence_image_url": overlay_url,
        "trace": trace,
    }