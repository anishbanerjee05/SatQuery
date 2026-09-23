# SatQuery AI — MVP

Agentic satellite imagery analysis assistant. Ask plain-language questions about satellite images and get answers with visual evidence and confidence scores.

## Architecture

- **Backend**: FastAPI + LangGraph (single service, not microservices)
- **Frontend**: Next.js 14 + Tailwind + shadcn/ui
- **LLM/VLM**: OpenRouter free-tier models (with fallback)
- **Database**: PostgreSQL (Neon/Supabase)
- **Storage**: Cloudflare R2 / Supabase Storage (S3-compatible)

## Project Structure

```
SatQuery/
├── satquery-backend/    # FastAPI backend
│   ├── app/
│   │   ├── agent/       # LangGraph nodes & graph
│   │   ├── api/         # FastAPI routes
│   │   ├── db/          # SQLModel + Alembic
│   │   ├── schemas/     # Pydantic models
│   │   └── services/    # OpenRouter, Storage, Image utils
│   └── tests/
└── satquery-frontend/   # Next.js frontend
    ├── app/
    ├── components/
    └── lib/
```

## Quick Start

### Backend
```bash
cd satquery-backend
cp .env.example .env
# Edit .env with your credentials
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd satquery-frontend
cp .env.example .env.local
# Edit .env.local with API URL
npm install
npm run dev
```

## Query Types

| Type | Input | Use Case |
|------|-------|----------|
| `single` | 1 image | VQA, captioning, grounding |
| `bitemporal` | 2 images (T1, T2) | Change detection |
| `optical_sar` | 2 images (optical, SAR) | Multi-modal fusion |

## Deployment

- **Backend**: Railway or Fly.io (always-on paid tier)
- **Frontend**: Vercel
- **DB**: Neon or Supabase Postgres
- **Storage**: Cloudflare R2 or Supabase Storage

## Environment Variables

See `.env.example` in each subdirectory.

## MVP Scope Notes

- No fine-tuned models — all reasoning via prompted OpenRouter free-tier calls
- No true geo-registration — assumes pre-aligned inputs
- No trained change detection — pixel-diff heuristic + LLM description
- No trained grounding — LLM-estimated bounding boxes
- Single backend service running LangGraph agent
- Confidence = LLM self-reported heuristic (not calibrated)