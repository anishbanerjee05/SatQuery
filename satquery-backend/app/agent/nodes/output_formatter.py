from app.agent.state import AgentState


async def output_formatter_node(state: AgentState) -> AgentState:
    trace = state.get("trace", [])
    trace.append({"node": "output_formatter", "summary": "Assembled final response"})

    return {
        **state,
        "trace": trace,
    }