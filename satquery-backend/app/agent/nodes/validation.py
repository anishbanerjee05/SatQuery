import json
from app.agent.state import AgentState
from app.services.openrouter_client import openrouter_client


VALIDATION_PROMPT = """You are a quality assurance reviewer for satellite imagery analysis.
Given a specialist's answer and the original question, evaluate:
1. Confidence score (0.0 to 1.0) - how confident are you that the answer is correct based on visual evidence?
2. Any inconsistencies - does the answer mention things not visible in the imagery? (You don't see the image, so flag obvious logical inconsistencies)
3. Whether the answer actually addresses the question

Return ONLY a JSON object with keys:
- "confidence": float (0.0-1.0)
- "inconsistencies": array of strings (empty if none)
- "addresses_question": boolean

Be honest - if the answer seems speculative or generic, give lower confidence."""


async def validation_node(state: AgentState) -> AgentState:
    question = state["question"]
    specialist_output = state.get("specialist_output", {})
    answer = specialist_output.get("answer", state.get("final_answer", ""))

    messages = [
        {"role": "system", "content": VALIDATION_PROMPT},
        {
            "role": "user",
            "content": f"Question: {question}\n\nAnswer to evaluate: {answer}",
        },
    ]

    response = await openrouter_client.chat_with_fallback(
        messages=messages,
        use_vision=False,
        temperature=0.0,
        max_tokens=300,
        response_format={"type": "json_object"},
    )

    try:
        result = json.loads(response)
        confidence = float(result.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))
        inconsistencies = result.get("inconsistencies", [])
        addresses_question = result.get("addresses_question", True)
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        confidence = 0.5
        inconsistencies = ["Validation parse failed"]
        addresses_question = True

    if inconsistencies:
        answer += f"\n\n[Validation flags: {'; '.join(inconsistencies)}]"

    trace = state.get("trace", [])
    trace.append({"node": "validation", "summary": f"Confidence: {confidence:.2f}, addresses_question: {addresses_question}"})

    return {
        **state,
        "confidence": confidence,
        "final_answer": answer,
        "trace": trace,
    }