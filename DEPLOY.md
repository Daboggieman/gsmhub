# Deploying GSMHub to Render (free tier) — manual setup

Two Render **Web Services** from this repo, created by hand in the Render
dashboard (no blueprint file). MongoDB stays on Atlas (already external).
Redis is optional — see Notes.

## Service 1 — API (NestJS)

Render dashboard → **New → Web Service** → connect this GitHub repo, then:

| Setting | Value |
|---|---|
| Name | `gsmhub-api` |
| Language / Runtime | Node |
| Root Directory | `backend` |
| Build Command | `pnpm install --frozen-lockfile && pnpm run build` |
| Start Command | `pnpm run start:prod` |
| Health Check Path | `/devices` |
| Instance Type | Free |

Environment variables (dashboard → Environment):

| Key | Value |
|---|---|
| `NODE_VERSION` | `22.22.1` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | your Atlas URI — **include a db name** (`…mongodb.net/gsmhub?…`), or Mongo uses the `test` database |
| `JWT_SECRET` | same value as `backend/.env` |
| `FRONTEND_URL` | `https://gsmhub-web.onrender.com` (CORS allow-list — after step 2 confirms the URL) |

## Service 2 — Frontend (Next.js)

**New → Web Service** → same repo, then:

| Setting | Value |
|---|---|
| Name | `gsmhub-web` |
| Language / Runtime | Node |
| Root Directory | `frontend` |
| Build Command | `pnpm install --frozen-lockfile && pnpm run build` |
| Start Command | `pnpm run start` |
| Instance Type | Free |

Environment variables:

| Key | Value |
|---|---|
| `NODE_VERSION` | `22.22.1` |
| `NODE_ENV` | `production` |
| `BACKEND_URL` | `https://gsmhub-api.onrender.com` — **must exist before the first build**; Next bakes the `/api` proxy target into the build manifest |
| `NEXT_PUBLIC_SITE_URL` | `https://gsmhub-web.onrender.com` |
| `NODE_EXTRA_CA_CERTS` | `/opt/render/project/src/certs/rapidssl-g1.pem` |

`NODE_EXTRA_CA_CERTS` is what makes phonedb.net device photos load
(phonedb serves an incomplete TLS chain). Do not remove it — and it's why
Vercel was ruled out (its image optimizer can't take a custom CA bundle).

Create the **API first** so the frontend's `BACKEND_URL` is valid on its
first build.

## Before you deploy

1. **Push to GitHub** (commit `DEPLOY.md`, `certs/rapidssl-g1.pem`,
   `backend/prod-paths.cjs`, `backend/package.json` + `pnpm-lock.yaml`,
   and the source edits).
2. **Atlas → Network Access → add `0.0.0.0/0`** — Render free services
   have no static outbound IPs, so the allow-list must admit them
   (rely on the DB credentials).

## Verify

- https://gsmhub-web.onrender.com — homepage shows device photos
- https://gsmhub-api.onrender.com/devices — JSON list
- Admin login works the same as local (httpOnly `auth_token` cookie)

## Notes & caveats

- **Cold starts**: free services spin down after ~15 min idle; first
  request then takes ~30–60 s. If the frontend renders empty right after
  a deploy, retry once while the API wakes.
- **Redis**: without `REDIS_URI` the API runs cache-degraded (fail-soft by
  design, crash-proofed). For caching later: free Upstash Redis → set
  `REDIS_URI=rediss://…` on `gsmhub-api`. No code change.
- **Redeploys** are automatic on every push to the deployed branch.
- The production start command is
  `node -r ./prod-paths.cjs dist/backend/src/main` — the hook resolves
  the `@shared/*` / `@modules/*` tsconfig aliases that tsc leaves in the
  compiled JS.
