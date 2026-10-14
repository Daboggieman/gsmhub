# GSMHub Organic Test Guide

Use this workflow to run the project locally and inspect it end-to-end.

## 1. Prerequisites

Install Node.js 18+, pnpm 10.12.1, MongoDB, and Redis.

Confirm the tools are available:

```bash
node --version
pnpm --version
mongosh --version
redis-cli --version
```

Install project dependencies from the repository root:

```bash
cd /home/student/gsmhub
pnpm install
```

## 2. Start MongoDB and Redis

If they are installed as system services:

```bash
sudo systemctl start mongod
sudo systemctl start redis
```

Alternatively, start disposable instances with Docker:

```bash
docker run -d \
  --name gsmhub-mongodb \
  -p 27017:27017 \
  mongo:7

docker run -d \
  --name gsmhub-redis \
  -p 6379:6379 \
  redis:7
```

Verify both services:

```bash
mongosh mongodb://localhost:27017/gsmhub --eval "db.runCommand({ ping: 1 })"
redis-cli ping
```

The Redis command should return `PONG`.

## 3. Configure the Backend

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Generate a strong development JWT secret:

```bash
openssl rand -base64 48
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=3001

MONGO_URI=mongodb://localhost:27017/gsmhub
REDIS_URI=redis://localhost:6379

JWT_SECRET=paste-the-generated-secret-here

FRONTEND_URL=http://localhost:3000
COOKIE_SAME_SITE=lax

JSON_BODY_LIMIT=1mb
URLENCODED_BODY_LIMIT=100kb

# Optional external API configuration
RAPIDAPI_KEY=
PRIMARY_API_HOST=phone-specs-explorer-api.p.rapidapi.com
PRIMARY_API_URL=https://phone-specs-explorer-api.p.rapidapi.com
SECONDARY_API_HOST=gsmarenaparser.p.rapidapi.com
SECONDARY_API_URL=https://gsmarenaparser.p.rapidapi.com
TERTIARY_API_HOST=mobile-phones2.p.rapidapi.com
TERTIARY_API_URL=https://mobile-phones2.p.rapidapi.com
```

Do not use the example JWT secret in any real environment.

## 4. Seed Development Data

Run the seed script from the backend directory:

```bash
cd /home/student/gsmhub/backend
pnpm seed
```

The seed creates sample categories and devices, plus this development admin account:

```text
Email: admin@gsmhub.com
Password: admin123
```

Warning: the seed script deletes existing devices, categories, and price history before inserting sample data. Only run it against a disposable development database. Change or remove the seeded admin before using a shared or production database.

## 5. Start the Backend

Open terminal 1:

```bash
cd /home/student/gsmhub/backend
pnpm start:dev
```

The API should listen at `http://localhost:3001`.

Check the liveness endpoint:

```bash
curl http://localhost:3001/health/live
```

Expected response:

```json
{
  "status": "ok",
  "uptime": 12.34
}
```

Check readiness and MongoDB connectivity:

```bash
curl http://localhost:3001/health/ready
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

If readiness returns `503`, confirm that MongoDB is running, `MONGO_URI` is correct, the backend loaded `backend/.env`, and port 27017 is accessible.

## 6. Configure the Frontend

Create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env.local
```

It should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 7. Start the Frontend

Open terminal 2:

```bash
cd /home/student/gsmhub/frontend
pnpm dev
```

Open `http://localhost:3000` in a browser.

Log in to the admin panel at `http://localhost:3000/admin/login` using the seeded development credentials.

## 8. Inspect the Public Site

Visit these routes:

```text
http://localhost:3000/
http://localhost:3000/devices
http://localhost:3000/compare
http://localhost:3000/search
http://localhost:3000/categories
http://localhost:3000/brands
```

Verify that:

- Devices load without browser console errors.
- Search suggestions appear after typing.
- Device pages show specifications, prices, images, and reviews.
- Comparison allows multiple devices to be selected.
- Empty states and failed API requests are handled visibly.
- Browser refreshes work on dynamic routes.
- The layout works on desktop and mobile viewport widths.

## 9. Inspect Authentication

At `/admin/login`:

1. Log in with the seeded account.
2. Refresh the page and confirm the session remains valid.
3. Open protected admin pages directly.
4. Log out.
5. Confirm protected admin pages reject or redirect unauthenticated users.

## 10. Inspect Admin Data Management

Visit:

```text
/admin/dashboard
/admin/devices
/admin/devices/new
/admin/categories
/admin/brands
```

Test the following workflows:

- Create and edit a device.
- Verify required-field validation.
- Verify image URL validation.
- Select a category and device type.
- Add and search specifications.
- Save and publish the device.
- Disable or delete records.
- Attempt duplicate slugs and invalid data.
- Confirm errors are shown without losing entered form data.

## 11. Run Automated Verification

From the repository root:

```bash
cd /home/student/gsmhub
pnpm typecheck
pnpm test
pnpm build
```

The current expected test totals are:

- Backend: 64 passing tests.
- Frontend: 19 passing tests.

Run the suites independently when diagnosing failures:

```bash
pnpm --filter backend test --runInBand
pnpm --filter frontend test --run
```

Run linting and backend coverage:

```bash
pnpm lint
pnpm --filter backend test:cov
```

## 12. Run End-to-End Tests

Keep MongoDB, Redis, the backend, and the frontend running. From the repository root, run:

```bash
pnpm test:e2e
```

The backend also has its own E2E suite:

```bash
cd /home/student/gsmhub/backend
pnpm test:e2e
```

If Playwright browsers are missing:

```bash
pnpm exec playwright install
```

## 13. Run a Production-Like Build

Build both applications:

```bash
cd /home/student/gsmhub
pnpm build
```

The webpack frontend build is the reliable fallback if Turbopack encounters an environment-specific worker error:

```bash
pnpm --filter frontend exec next build --webpack
```

Start the compiled backend in terminal 1:

```bash
cd /home/student/gsmhub/backend
pnpm start:prod
```

Start the compiled frontend in terminal 2:

```bash
cd /home/student/gsmhub/frontend
pnpm start
```

Open `http://localhost:3000` again and repeat the primary public and admin workflows.

## 14. Diagnostics

Check which processes use the application ports:

```bash
lsof -i :3000
lsof -i :3001
```

Check API responses directly:

```bash
curl -i http://localhost:3001/health/live
curl -i http://localhost:3001/health/ready
curl -i http://localhost:3001/devices
curl -i http://localhost:3001/categories
```

Keep the backend terminal visible and inspect the browser's Developer Tools Console and Network panels.

A healthy local setup should show:

- Frontend running on port 3000.
- Backend running on port 3001.
- MongoDB readiness reported as connected.
- Devices and categories returned by the API.
- No repeated failed requests in the browser Network panel.
- Admin login succeeding and maintaining its session.
