# GSMHub Frontend

Next.js (App Router) frontend for GSMHUB — public device catalog,
comparison, and the `/admin` panel.

Part of the pnpm workspace, with `@gsmhub/shared` linked from `../shared`.

> This project runs **Next.js 16** — consult the bundled docs at
> `node_modules/next/dist/docs/` (see `AGENTS.md`) before writing code;
> conventions may differ from older Next.js versions.

## Setup

```bash
pnpm install                 # from the repo root (workspace install)
pnpm run dev                 # http://localhost:3000
```

**API access:** the browser always calls same-origin `/api/*`; the Next.js
server proxies those requests to the backend (`BACKEND_URL`, default
`http://localhost:3001`) via `next.config.ts` rewrites. This keeps the
auth cookie first-party — do not point the browser at the backend origin
directly. Server-side (SSR) calls use `BACKEND_URL` directly.

Optional env vars (`.env.example`): `BACKEND_URL`, `NEXT_PUBLIC_SITE_URL`
(robots/sitemap), `NEXT_PUBLIC_ADSENSE_ID` +
`NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` (after AdSense approval — see
[docs/monetization-setup.md](../docs/monetization-setup.md)).

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm run dev` | Dev server |
| `pnpm run build` | Production build |
| `pnpm run start` | Serve the production build |
| `pnpm run lint` | ESLint |
| `pnpm test` | Vitest unit tests |

## Areas

- `/` — device catalog, search, comparison, price widget
- `/admin` — dashboard, devices (bulk import/sync), prices, categories,
  brands, users, audit logs (JWT cookie auth)
- `/privacy`, `/terms`, `/about`, `/contact`, `/ads.txt` — policy &
  approval pages
