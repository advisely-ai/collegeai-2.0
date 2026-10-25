# CollegeAI 2.0

Mobile-browser web app for CollegeAI: onboarding, Discover yourself, profile building, reflection journal, and access & trust.

## Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (async), asyncpg, Alembic, pydantic-settings. Managed with uv.
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Query. Managed with pnpm.
- **Database:** Postgres 16 (Docker locally, Neon on Vercel).

## Run locally

Requirements: Docker, uv, pnpm, Node 22+.

```bash
# 1. Database
docker compose up -d db

# 2. Backend
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
pnpm install
pnpm dev            # http://localhost:3000
```

The frontend calls `/api/v1/*` on its own origin. `next.config.ts` forwards those requests to `API_BASE_URL` (default `http://localhost:8000`).

## Create a migration

```bash
cd backend
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

Models live in `backend/app/models.py`. `alembic/env.py` imports them, so autogenerate sees every table.

## Layout

```
backend/   FastAPI app, models, Alembic migrations, vercel.json
frontend/  Next.js app (onboarding, Home, Discover, Profile, Reflect, Trust)
```

## Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md).
