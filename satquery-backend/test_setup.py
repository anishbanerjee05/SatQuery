import asyncio
import sys
sys.path.insert(0, ".")

from app.config import settings
from app.db.session import init_db
from app.agent.graph import graph


async def test_graph():
    print("Testing LangGraph compilation...")
    print(f"Graph nodes: {list(graph.nodes.keys())}")
    print("Graph compiled successfully!")

    print("\nTesting config...")
    print(f"Vision model: {settings.openrouter_vision_model}")
    print(f"Text model: {settings.openrouter_text_model}")
    print(f"DB URL configured: {'yes' if settings.database_url else 'no'}")


if __name__ == "__main__":
    asyncio.run(test_graph())