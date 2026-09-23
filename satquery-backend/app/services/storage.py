import os
import uuid
import base64
import logging
from pathlib import Path
from typing import Optional
import httpx
import boto3
from botocore.config import Config
from app.config import settings

logger = logging.getLogger("satquery.storage")

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class StorageService:
    def __init__(self):
        self.bucket = settings.storage_bucket
        self.is_s3_configured = (
            bool(settings.storage_access_key)
            and "your_access_key" not in settings.storage_access_key
            and "your-account" not in settings.storage_endpoint
        )
        if self.is_s3_configured:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    endpoint_url=settings.storage_endpoint,
                    aws_access_key_id=settings.storage_access_key,
                    aws_secret_access_key=settings.storage_secret_key,
                    config=Config(signature_version="s3v4"),
                    region_name=settings.storage_region,
                )
            except Exception as e:
                logger.warning(f"Failed to initialize S3 client: {e}. Falling back to local storage.")
                self.is_s3_configured = False
                self.s3_client = None
        else:
            self.s3_client = None

    async def upload_image(self, file_bytes: bytes, content_type: str, prefix: str = "uploads") -> str:
        ext = content_type.split("/")[-1].replace("jpeg", "jpg")
        filename = f"{uuid.uuid4()}.{ext}"
        
        if self.is_s3_configured and self.s3_client:
            try:
                key = f"{prefix}/{filename}"
                self.s3_client.put_object(
                    Bucket=self.bucket,
                    Key=key,
                    Body=file_bytes,
                    ContentType=content_type,
                )
                return f"{settings.storage_endpoint}/{self.bucket}/{key}"
            except Exception as e:
                logger.warning(f"S3 upload failed: {e}. Saving locally instead.")

        # Local storage fallback
        dest_dir = UPLOAD_DIR / prefix
        dest_dir.mkdir(parents=True, exist_ok=True)
        file_path = dest_dir / filename
        file_path.write_bytes(file_bytes)
        
        # Return URL accessible via FastAPI static mount
        return f"http://localhost:8000/static/uploads/{prefix}/{filename}"

    async def download_image(self, url: str) -> bytes:
        # 1. Base64 Data URL
        if url.startswith("data:image"):
            header, encoded = url.split(",", 1)
            return base64.b64decode(encoded)

        # 2. Local static URL or relative path
        if "/static/uploads/" in url:
            rel_path = url.split("/static/uploads/")[-1]
            local_file = UPLOAD_DIR / rel_path
            if local_file.exists():
                return local_file.read_bytes()

        # 3. HTTP / HTTPS external or local URL
        if url.startswith("http://") or url.startswith("https://"):
            if self.is_s3_configured and self.s3_client and f"{self.bucket}/" in url:
                try:
                    key = url.split(f"{self.bucket}/")[-1]
                    response = self.s3_client.get_object(Bucket=self.bucket, Key=key)
                    return response["Body"].read()
                except Exception as e:
                    logger.warning(f"S3 download failed for {url}: {e}. Trying HTTP fetch.")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    return resp.content

        # 4. Direct file system path
        path = Path(url)
        if path.exists():
            return path.read_bytes()

        raise FileNotFoundError(f"Could not download or locate image at: {url}")

    def get_presigned_url(self, key: str, expiration: int = 3600) -> str:
        if self.is_s3_configured and self.s3_client:
            return self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expiration,
            )
        return f"http://localhost:8000/static/uploads/{key}"


storage_service = StorageService()