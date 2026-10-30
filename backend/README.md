# GSMHub Backend

NestJS API for GSMHUB — device specifications, search, comparison, price
tracking, and admin (auth, users, audit logs).

Part of the pnpm workspace (`@gsmhub/backend` conceptually; the package is
`backend/` with `@gsmhub/shared` linked from `../shared`).

## Setup

```bash
pnpm install            # from the repo root (workspace install)
cp .env.example .env    # then fill in MONGO_URI, REDIS_URI, JWT_SECRET (≥32 chars)
pnpm run start:dev      # ts-node-dev on port 3001
```

Key env vars: `MONGO_URI`, `REDIS_URI`, `JWT_SECRET`, `FRONTEND_URL`
(CORS origins), optional `COOKIE_SAME_SITE` / `COOKIE_DOMAIN`. See
`.env.example`.

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm run start:dev` | Watch mode (ts-node-dev) |
| `pnpm run build` | Compile with `tsc` → `dist/backend/src/main` |
| `pnpm run start:prod` | Run the compiled build |
| `pnpm test` | Jest unit tests |
| `pnpm run seed:gsma` | Seed brands/categories/admin |
| `pnpm run seed:phonedb` | Seed device catalog from PhoneDB dataset |
| `src/seed-prices.ts` | Seed price history (run with ts-node, see docs/deployment.md) |

## Documentation

- API endpoints: [docs/build_docs/api-reference.md](../docs/build_docs/api-reference.md)
- Data model: [docs/build_docs/data-model.md](../docs/build_docs/data-model.md)
- External providers & sync: [docs/build_docs/external-apis.md](../docs/build_docs/external-apis.md), [sync-service.md](../docs/build_docs/sync-service.md)
- Deployment: [docs/deployment.md](../docs/deployment.md)
