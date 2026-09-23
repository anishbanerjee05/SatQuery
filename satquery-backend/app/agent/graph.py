from langgraph.graph import StateGraph, END
from app.agent.state import AgentState
from app.agent.nodes.router import router_node
from app.agent.nodes.preprocess import preprocess_node
from app.agent.nodes.vqa_captioning import vqa_captioning_node
from app.agent.nodes.change_detection import change_detection_node
from app.agent.nodes.grounding import grounding_node
from app.agent.nodes.fusion import fusion_node
from app.agent.nodes.validation import validation_node
from app.agent.nodes.output_formatter import output_formatter_node


def route_to_specialist(state: AgentState) -> str:
    task = state.get("detected_task", "vqa")
    return {
        "vqa": "vqa_captioning",
        "change_detection": "change_detection",
        "grounding": "grounding",
        "fusion": "fusion",
    }.get(task, "vqa_captioning")


def build_graph() -> StateGraph:
    workflow = StateGraph(AgentState)

    workflow.add_node("router", router_node)
    workflow.add_node("preprocess", preprocess_node)
    workflow.add_node("vqa_captioning", vqa_captioning_node)
    workflow.add_node("change_detection", change_detection_node)
    workflow.add_node("grounding", grounding_node)
    workflow.add_node("fusion", fusion_node)
    workflow.add_node("validation", validation_node)
    workflow.add_node("output_formatter", output_formatter_node)

    workflow.set_entry_point("router")
    workflow.add_edge("router", "preprocess")
    workflow.add_conditional_edges(
        "preprocess",
        route_to_specialist,
        {
            "vqa_captioning": "vqa_captioning",
            "change_detection": "change_detection",
            "grounding": "grounding",
            "fusion": "fusion",
        },
    )
    workflow.add_edge("vqa_captioning", "validation")
    workflow.add_edge("change_detection", "validation")
    workflow.add_edge("grounding", "validation")
    workflow.add_edge("fusion", "validation")
    workflow.add_edge("validation", "output_formatter")
    workflow.add_edge("output_formatter", END)

    return workflow.compile()


graph = build_graph()