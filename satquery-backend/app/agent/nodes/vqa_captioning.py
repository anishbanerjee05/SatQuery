from app.agent.state import AgentState
from app.services.openrouter_client import openrouter_client
from app.services.storage import storage_service


VQA_PROMPT = """You are a satellite imagery analyst. Answer the user's question about the image directly and concisely.
Base your answer only on what you can see in the image. If you cannot determine something, say so.
Do not speculate beyond visual evidence. Be specific about features you observe (land cover, water bodies, urban areas, agriculture, etc.)."""


async def vqa_captioning_node(state: AgentState) -> AgentState:
    question = state["question"]
    image_url = state["preprocessed"]["single"]["url"]

    messages = [
        {"role": "system", "content": VQA_PROMPT},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": question},
                {"type": "image_url", "image_url": {"url": image_url}},
            ],
        },
    ]

    answer = await openrouter_client.chat_with_fallback(
        messages=messages,
        use_vision=True,
        temperature=0.2,
        max_tokens=1000,
    )

    trace = state.get("trace", [])
    trace.append({"node": "vqa_captioning", "summary": "Answered visual question about single image"})

    return {
        **state,
        "specialist_output": {"answer": answer},
        "final_answer": answer,
        "trace": trace,
    }