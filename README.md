# GSMHUB

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red?logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**GSMHUB** is a high-performance, information-dense device specifications platform inspired by industry leaders like GSMArena. It provides comprehensive technical data, price tracking, and side-by-side comparisons for smartphones, tablets, laptops, and more.

---

## Quick Links

- **[Documentation Index](docs/README.md)** - All guides and references.
- **[Deployment Guide](docs/deployment.md)** - Render + MongoDB Atlas free stack (Blueprint included).
- **[Monetization Setup](docs/monetization-setup.md)** - AdSense, Amazon Associates, Jumia/Kolibri.
- **[Roadmap](ROADMAP.md)** - Current status and future development phases.
- **[Implementation Log](docs/implementation_history/session-log.md)** - Chronological development history.
- **[Shared Types](shared/src/types/index.ts)** - Centralized TypeScript definitions.

---

## Features

### Public Frontend

- **Information-Dense UI**: Search-first, 3-column layout for desktop and optimized mobile view.
- **Advanced Search**: Real-time, debounced fuzzy search with autocomplete and image previews.
- **Comparison Engine**: Side-by-side specification comparison with numeric difference highlighting.
- **SEO Optimized**: Dynamic metadata, JSON-LD Product schema, and automatic sitemaps.
- **Price Tracking**: Latest prices per country/retailer with historical trend analysis, currency-aware best-deal highlighting, and affiliate "Buy Now" links.

### Admin Panel

- **Secure Authentication**: JWT-based auth with Passport.js (Local/JWT strategies).
- **Price Management**: Centralized price entry editor with device picker (`/admin/prices`).
- **Affiliate Link Generator**: Tracked retailer links built from the device name (Amazon, Jumia, Flipkart, Google Shopping).
- **User Management**: Admin accounts, roles, and activation with audit logging.
- **Data Command Center**: Manage devices, categories, and brands with ease.
- **Dynamic Forms**: Tabbed interface with searchable dropdowns and auto-suggestions.
- **Live Analytics**: Dashboard widgets for popular devices, trending searches, and system stats.

---

## Tech Stack

### Core

- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router, Server Components)
- **Backend**: [NestJS](https://nestjs.com/) (Modular Architecture)
- **Shared**: Centralized TypeScript types and utility functions.

### Data & Infrastructure

- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (via Mongoose)
- **Caching**: [Redis](https://redis.io/) (for high-speed device data and search results)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: FontAwesome 6

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- Redis instance

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Daboggieman/gsmhub.git
   cd gsmhub
   ```

2. **Backend Setup**

   ```bash
   cd backend
   pnpm install
   # Create .env — copy .env.example and fill in MONGO_URI, REDIS_URI, JWT_SECRET
   pnpm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   pnpm install
   # Nothing required for local dev — the frontend proxies /api/* to the
   # backend via next.config.ts rewrites (BACKEND_URL, default localhost:3001).
   # Optional: copy .env.example to .env.local and set NEXT_PUBLIC_SITE_URL.
   pnpm run dev
   ```

> For deployment (free Render + Atlas stack) see **[docs/deployment.md](docs/deployment.md)**.

---

## Project Structure

```text
gsmhub/
├── backend/    # NestJS API (Modules: Devices, Search, Categories, Prices, Auth, Users, etc.)
├── frontend/   # Next.js App (App Router, Admin Panel, Components)
├── shared/     # Unified TypeScript types and shared utilities
├── e2e/        # Playwright end-to-end tests
├── docs/       # Deployment, monetization, API reference, runbooks, dev log
└── render.yaml # Render Blueprint (one-click free-stack deployment)
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
