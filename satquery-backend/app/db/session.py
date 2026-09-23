import os
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlmodel import SQLModel
from app.config import settings

logger = logging.getLogger("satquery.db")

def _get_engine():
    db_url = settings.database_url
    # If the postgres url contains placeholder or is empty, use SQLite
    if not db_url or "user:password@host" in db_url or "localhost:5432" in db_url:
        logger.info("Using local SQLite database for SatQuery...")
        return create_async_engine("sqlite+aiosqlite:///./satquery.db", echo=False)
    
    try:
        return create_async_engine(db_url, echo=False, pool_pre_ping=True)
    except Exception as e:
        logger.warning(f"Could not connect to {db_url} ({e}). Falling back to local SQLite.")
        return create_async_engine("sqlite+aiosqlite:///./satquery.db", echo=False)

engine = _get_engine()
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    global engine, async_session_maker
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
    except Exception as e:
        logger.warning(f"Database initialization with primary engine failed: {e}. Switching to SQLite fallback.")
        engine = create_async_engine("sqlite+aiosqlite:///./satquery.db", echo=False)
        async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session