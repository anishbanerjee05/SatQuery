import json
from app.agent.state import AgentState
from app.services.openrouter_client import openrouter_client


ROUTER_PROMPT = """You are a task classifier for a satellite imagery analysis assistant.
Given a user's question and the input type (single image, bi-temporal pair, or optical+SAR pair),
classify the task into exactly one of these categories:

- "vqa": Visual question answering / captioning - asking about what is in a single image
- "change_detection": Comparing two images from different times (bi-temporal) to find changes
- "grounding": Locating a specific object or region in an image (returning bounding box)
- "fusion": Reasoning across both optical and SAR imagery together

Return ONLY a JSON object with the key "task" and the classified task as value.
Example: {"task": "change_detection"}"""


async def router_node(state: AgentState) -> AgentState:
    question = state["question"]
    input_type = state["input_type"]

    messages = [
        {"role": "system", "content": ROUTER_PROMPT},
        {"role": "user", "content": f"Question: {question}\nInput type: {input_type}"},
    ]

    response = await openrouter_client.chat_with_fallback(
        messages=messages,
        use_vision=False,
        temperature=0.0,
        max_tokens=100,
        response_format={"type": "json_object"},
    )

    try:
        result = json.loads(response)
        detected_task = result.get("task", "vqa")
    except (json.JSONDecodeError, KeyError):
        detected_task = "vqa"

    # Strict modality guardrail enforcement
    if input_type == "bitemporal":
        detected_task = "change_detection"
    elif input_type == "optical_sar":
        detected_task = "fusion"
    else:  # single image
        if detected_task not in ["grounding", "vqa"]:
            # Check if user query implies object localization
            q_lower = question.lower()
            if any(k in q_lower for k in ["locate", "box", "bbox", "bounding", "where", "find", "ground", "coordinates"]):
                detected_task = "grounding"
            else:
                detected_task = "vqa"

    trace = state.get("trace", [])
    trace.append({"node": "router", "summary": f"Classified task as '{detected_task}' for input type '{input_type}'"})

    return {**state, "detected_task": detected_task, "trace": trace}