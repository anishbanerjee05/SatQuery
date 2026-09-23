from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.session import init_db
from app.api.routes_query import router as query_router
from app.api.routes_health import router as health_router
from app.services.openrouter_client import openrouter_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await openrouter_client.close()


app = FastAPI(
    title="SatQuery AI Backend",
    description="Agentic satellite imagery analysis API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static folder exists and mount it
static_dir = Path("static")
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(health_router, tags=["health"])
app.include_router(query_router, prefix="/api", tags=["queries"])