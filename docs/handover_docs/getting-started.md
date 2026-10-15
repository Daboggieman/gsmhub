# GSMHub — Developer Handover Guide

Quick-start guide for picking up this project. Written for a new developer taking over the codebase.

---

## What This Project Is

GSMHub is a device specifications website (GSMArena-style) with:
- **Frontend:** Next.js (App Router, TypeScript, Tailwind)
- **Backend:** NestJS (TypeScript)
- **Shared types:** `shared/` workspace package (`@gsmhub/shared`)
- **Database:** MongoDB (Mongoose)
- **Cache:** Redis

## Monorepo Structure

```
gsmhub/
├── backend/          # NestJS API server
├── frontend/         # Next.js frontend
├── shared/           # @gsmhub/shared — shared types & utilities
├── docs/             # This documentation
├── e2e/              # Playwright end-to-end tests
├── package.json      # pnpm workspace root
└── pnpm-workspace.yaml
```

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Environment variables** — see `.env.example` files in `backend/` and `frontend/`:

   - Backend needs: `MONGODB_URI`, `REDIS_URI`, `JWT_SECRET`, RapidAPI keys.
   - Frontend needs: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`.

3. **Start the backend:**

   ```bash
   cd backend
   pnpm run start:dev
   ```

   Backend runs on port **3001** (not 3000, to avoid Next.js conflict).

4. **Start the frontend:**

   ```bash
   cd frontend
   pnpm run dev
   ```

## Key Commands (from repo root)

| Command | What it does |
|---------|--------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm run build` | Build all packages (shared, backend, frontend) |
| `pnpm run typecheck` | TypeScript check across all packages |
| `pnpm run lint` | Lint backend + frontend |
| `pnpm run test` | Run all tests |

## Default Admin Credentials

- **Email:** `admin@gsmhub.com`
- **Password:** `admin123`

Admin panel: `/admin/login`

## Architecture Notes

- **Workspace linking:** `@gsmhub/shared` is a pnpm workspace package linked into both backend and frontend via `"workspace:*"`.
- **Path aliases:** Backend uses `@shared/*` in `tsconfig.json` pointing to `../shared/src/*`.
- **Build:** Backend uses `tsc` directly (not `nest build`) to handle the monorepo shared module correctly.
- **Dev mode:** Backend uses `ts-node-dev` with `tsconfig-paths/register`.

## External APIs

See `docs/build_docs/external-apis.md` for the full API reference of the three device data providers.
See `docs/build_docs/sync-service.md` for how the sync pipeline behaves at runtime.

## Sync & Admin Operations

See `docs/handover_docs/sync-runbook.md` for how to run and troubleshoot device data sync.

## Project History

See `docs/implementation_history/session-log.md` for a chronological log of past work.
See `ROADMAP.md` for the full project roadmap (Phases 1-23).
