from typing import TypedDict, Literal, Optional, List, Dict, Any


class AgentState(TypedDict):
    question: str
    input_type: Literal["single", "bitemporal", "optical_sar"]
    image_urls: Dict[str, str]
    detected_task: Optional[str]
    preprocessed: Optional[Dict[str, Any]]
    specialist_output: Optional[Dict[str, Any]]
    confidence: Optional[float]
    evidence_image_url: Optional[str]
    trace: List[Dict[str, str]]
    final_answer: Optional[str]