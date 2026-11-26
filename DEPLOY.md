# Deploying GSMHub to Render (free tier)

Two Render web services from this repo, defined in [render.yaml](render.yaml):

| Service | Path | URL after deploy |
|---|---|---|
| `gsmhub-api` | NestJS API (`backend/`) | https://gsmhub-api.onrender.com |
| `gsmhub-web` | Next.js frontend (`frontend/`) | https://gsmhub-web.onrender.com |

MongoDB stays on Atlas (already external). Redis is optional — see below.

## Steps

1. **Push to GitHub.** Blueprint deploys come from a Git repo. Include:
   `render.yaml`, `certs/rapidssl-g1.pem` (public CA cert, safe to commit),
   `backend/prod-paths.cjs`, the `express` dependency in
   `backend/package.json` + `pnpm-lock.yaml`.

2. **Atlas network access.** Render free services have no static outbound
   IPs → Atlas → Network Access → add `0.0.0.0/0` (allow from anywhere;
   rely on the DB credentials). While in Atlas, make sure `MONGO_URI`
   includes a database name (`…mongodb.net/gsmhub?…`) — otherwise Mongo
   uses the `test` database.

3. **Apply the blueprint.** Render dashboard → New → Blueprint → this
   repo. Render prompts for the two secrets:
   - `MONGO_URI` — the Atlas connection string
   - `JWT_SECRET` — the same value as in `backend/.env`

   Everything else (ports, build/start commands, cross-service URLs, the
   phonedb TLS CA bundle) is already in `render.yaml`.

4. **Verify.** Open https://gsmhub-web.onrender.com — homepage should show
   device photos. Check https://gsmhub-api.onrender.com/devices returns
   JSON. Admin login works the same as local (cookie `auth_token`).

## Notes & caveats

- **Cold starts.** Free services spin down after ~15 min idle; the first
  request then takes ~30–60 s. The frontend will time out on its first
  render while the API cold-starts — retry once.
- **Images.** `NODE_EXTRA_CA_CERTS` (in render.yaml) is what makes
  phonedb.net photos load — do not remove it. Vercel was ruled out
  because its image optimizer can't take a custom CA bundle.
- **Redis.** Without `REDIS_URI` the API runs with caching degraded
  (fail-soft by design). For caching, create a free Upstash Redis and set
  `REDIS_URI=rediss://…` on `gsmhub-api` — no code change.
- **Redeploys** are automatic on every push to the deployed branch.
- The production start command is
  `node -r ./prod-paths.cjs dist/backend/src/main` — the hook resolves
  the `@shared/*` / `@modules/*` tsconfig aliases that tsc leaves in the
  compiled JS.
