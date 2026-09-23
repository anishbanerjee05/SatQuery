# SatQuery AI Backend

Agentic satellite imagery analysis API built with FastAPI, LangGraph, and OpenRouter.

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL (Neon, Supabase, or local)
- Cloudflare R2 or Supabase Storage (S3-compatible)
- OpenRouter API key

### Setup

1. Copy `.env.example` to `.env` and fill in your credentials
2. Install dependencies:
   ```bash
   pip install -e ".[dev]"
   ```
3. Run database migrations:
   ```bash
   alembic upgrade head
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### API Endpoints

- `GET /health` - Health check
- `POST /api/query` - Submit analysis query (multipart/form-data)
- `GET /api/query/{id}` - Get query result
- `GET /api/queries` - List query history

### Query Types

1. **Single Image** (`input_type=single`): Visual Q&A, captioning, grounding
2. **Bi-temporal** (`input_type=bitemporal`): Change detection between T1/T2
3. **Optical+SAR** (`input_type=optical_sar`): Multi-modal fusion analysis

### Deployment

Docker:
```bash
docker build -t satquery-backend .
docker run -p 8000:8000 --env-file .env satquery-backend
```

Railway/Fly.io: Deploy the Docker image with environment variables configured.