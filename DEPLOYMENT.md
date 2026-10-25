# Deploying to Vercel

This repo deploys as **two Vercel projects** from the same Git repository:

| Project | Root Directory | Framework |
| --- | --- | --- |
| `collegeai-api` | `backend` | FastAPI (entrypoint `app.main:app` from `backend/pyproject.toml`) |
| `collegeai-web` | `frontend` | Next.js |

Deploy later, after the local stack is working. Nothing below needs to change in code.

## 1. Database (Neon via Vercel Storage)

1. In the Vercel dashboard, open the **API** project, go to **Storage**, and create a Neon Postgres database named `collegeai-20-db`.
2. Vercel adds `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) to the project.
3. Pull them locally for migrations:

   ```bash
   cd backend
   vercel env pull .env.production
   ```

## 2. Backend project (`collegeai-api`)

- Root Directory: `backend`
- Environment variables:
  - `DATABASE_URL` = the pooled Neon URL (Vercel sets this)
  - `CORS_ORIGINS` = the web project URL, e.g. `https://collegeai-web.vercel.app`

The pooled URL uses PgBouncer in transaction mode. `app/db.py` disables asyncpg's statement cache for that reason.

## 3. Migrations

Run Alembic against the **direct** (unpooled) URL. Do this before the first deploy and after every schema change:

```bash
cd backend
set -a && source .env.production && set +a
DATABASE_URL="$DATABASE_URL_UNPOOLED" uv run alembic upgrade head
```

`config.py` converts `postgresql://` and `sslmode=` to the asyncpg form automatically.

## 4. Frontend project (`collegeai-web`)

- Root Directory: `frontend`
- Environment variables:
  - `API_BASE_URL` = the backend project URL, e.g. `https://collegeai-api.vercel.app`

`next.config.ts` rewrites `/api/v1/*` to that URL, so the browser never talks to the API directly.

## 5. Checks

- Turn off **Deployment Protection** for production on both projects. Otherwise API calls from the browser get a Vercel login page.
- After changing env vars, redeploy. Vercel doesn't apply them to existing deployments.
- Smoke test: `curl https://<api>/api/v1/health` should return `{"status":"ok"}`, and `https://<web>/` should open onboarding.
