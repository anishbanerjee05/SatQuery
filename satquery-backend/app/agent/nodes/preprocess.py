from app.agent.state import AgentState
from app.services.storage import storage_service
from app.services.image_utils import load_image, resize_image, images_same_size, image_to_bytes
from app.services.openrouter_client import openrouter_client
import asyncio


async def download_and_preprocess(url: str) -> dict:
    image_bytes = await storage_service.download_image(url)
    image = load_image(image_bytes)
    original_size = image.size
    image = resize_image(image)
    processed_bytes = image_to_bytes(image)
    processed_url = await storage_service.upload_image(processed_bytes, "image/png", "preprocessed")
    return {
        "url": processed_url,
        "original_size": original_size,
        "processed_size": image.size,
    }


async def preprocess_node(state: AgentState) -> AgentState:
    input_type = state["input_type"]
    image_urls = state["image_urls"]

    preprocessed = {}

    if input_type == "single":
        preprocessed["single"] = await download_and_preprocess(image_urls["single"])
    elif input_type == "bitemporal":
        t1_task = download_and_preprocess(image_urls["t1"])
        t2_task = download_and_preprocess(image_urls["t2"])
        preprocessed["t1"], preprocessed["t2"] = await asyncio.gather(t1_task, t2_task)
        size_match = images_same_size(
            load_image(await storage_service.download_image(preprocessed["t1"]["url"])),
            load_image(await storage_service.download_image(preprocessed["t2"]["url"])),
        )
        preprocessed["size_match"] = size_match
    elif input_type == "optical_sar":
        opt_task = download_and_preprocess(image_urls["optical"])
        sar_task = download_and_preprocess(image_urls["sar"])
        preprocessed["optical"], preprocessed["sar"] = await asyncio.gather(opt_task, sar_task)
        size_match = images_same_size(
            load_image(await storage_service.download_image(preprocessed["optical"]["url"])),
            load_image(await storage_service.download_image(preprocessed["sar"]["url"])),
        )
        preprocessed["size_match"] = size_match

    trace = state.get("trace", [])
    trace.append({"node": "preprocess", "summary": f"Downloaded, resized, and validated {input_type} images"})

    return {**state, "preprocessed": preprocessed, "trace": trace}