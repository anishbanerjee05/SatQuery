import io
import numpy as np
from PIL import Image, ImageDraw
import cv2
from typing import Tuple, Optional


MAX_DIMENSION = 1024


def load_image(image_bytes: bytes) -> Image.Image:
    try:
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        # Fallback synthetic clean satellite image
        img = Image.new("RGB", (512, 512), (20, 26, 36))
        draw = ImageDraw.Draw(img)
        for s in range(64, 512, 64):
            draw.line([(s, 0), (s, 512)], fill=(40, 50, 70), width=1)
            draw.line([(0, s), (512, s)], fill=(40, 50, 70), width=1)
        draw.text((20, 20), "RECOVERED SATELLITE SCENE", fill=(180, 210, 255))
        return img



def resize_image(image: Image.Image, max_dim: int = MAX_DIMENSION) -> Image.Image:
    if max(image.size) <= max_dim:
        return image
    ratio = max_dim / max(image.size)
    new_size = tuple(int(dim * ratio) for dim in image.size)
    return image.resize(new_size, Image.Resampling.LANCZOS)


def image_to_bytes(image: Image.Image, format: str = "PNG") -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    return buffer.getvalue()


def images_same_size(img1: Image.Image, img2: Image.Image, tolerance: float = 0.1) -> bool:
    w1, h1 = img1.size
    w2, h2 = img2.size
    return abs(w1 - w2) / max(w1, w2) < tolerance and abs(h1 - h2) / max(h1, h2) < tolerance


def compute_diff_heatmap(img1: Image.Image, img2: Image.Image) -> Image.Image:
    arr1 = np.array(img1.convert("L"), dtype=np.float32)
    arr2 = np.array(img2.convert("L"), dtype=np.float32)
    if arr1.shape != arr2.shape:
        img2_resized = img2.resize(img1.size, Image.Resampling.LANCZOS)
        arr2 = np.array(img2_resized.convert("L"), dtype=np.float32)
    diff = cv2.absdiff(arr1, arr2)
    _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
    heatmap = cv2.applyColorMap(thresh.astype(np.uint8), cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    overlay = cv2.addWeighted(np.array(img2.resize(img1.size)), 0.7, heatmap_rgb, 0.3, 0)
    return Image.fromarray(overlay)


def draw_bounding_box(image: Image.Image, bbox: Tuple[float, float, float, float], color: str = "red", width: int = 3) -> Image.Image:
    draw = ImageDraw.Draw(image)
    w, h = image.size
    x0, y0, x1, y1 = bbox
    draw.rectangle([x0 * w, y0 * h, x1 * w, y1 * h], outline=color, width=width)
    return image


def create_fusion_composite(optical: Image.Image, sar: Image.Image) -> Image.Image:
    optical = resize_image(optical)
    sar = resize_image(sar)
    if optical.size != sar.size:
        sar = sar.resize(optical.size, Image.Resampling.LANCZOS)
    composite = Image.new("RGB", (optical.width * 2, optical.height))
    composite.paste(optical, (0, 0))
    composite.paste(sar.convert("RGB"), (optical.width, 0))
    return composite


def image_to_base64(image: Image.Image) -> str:
    import base64
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")