# GSMHub - Device Specifications Website

A comprehensive device specifications platform similar to GSMArena, built with modern web technologies.

## 🏗️ Architecture

**Frontend:** Next.js 14+ (React, App Router, TypeScript, Tailwind CSS)
**Backend:** NestJS (Node.js, TypeScript)
**Database:** PostgreSQL
**Cache:** Redis
**Deployment:** Vercel (Frontend) + Railway (Backend)

## 📁 Project Structure

```
gsmhub/
├── backend/          # NestJS API server
├── frontend/         # Next.js web application
├── shared/           # Shared TypeScript types and utilities
├── 55.txt           # Implementation roadmap
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (v22.18.0 recommended)
- PostgreSQL (local or cloud)
- Redis (local or cloud)
- Git

### Installation

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd gsmhub
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure environment variables
   npm run start:dev
   ```

3. **Frontend setup:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local  # Configure environment variables
   npm run dev
   ```

4. **Shared utilities:**
   ```bash
   cd ../shared
   npm install
   npm run build
   ```

## 📋 Development Roadmap

See [55.txt](55.txt) for the complete implementation roadmap with 23 phases covering:

- ✅ Project initialization & setup
- 🔄 Database design & backend modules
- 🔄 Frontend implementation
- 🔄 SEO optimization & monetization
- 🔄 Testing & deployment
- 🔄 Scaling & advanced features

## 🔑 Key Features

### Core Features
- **Device Database:** Comprehensive device specifications
- **Advanced Search:** Fuzzy search with autocomplete
- **Device Comparison:** Side-by-side spec comparison
- **Category Browsing:** Organized by device types
- **Price Tracking:** Historical pricing data

### Advanced Features
- **SEO Optimized:** Dynamic metadata, sitemaps, SSR/SSG
- **Admin Panel:** Content management system
- **Monetization:** Google AdSense, affiliate links
- **Performance:** Redis caching, CDN integration
- **Analytics:** User tracking and insights

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/gsmhub_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-here
API_KEY=your-external-api-key-here
NODE_ENV=development
PORT=3001
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Deploy to Railway/Render with environment variables
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel (auto-detects Next.js)
```

## 📊 API Documentation

### Base URL
```
http://localhost:3001/api (development)
https://api.gsmhub.com (production)
```

### Key Endpoints

- `GET /devices` - List devices with filters
- `GET /devices/:slug` - Get device details
- `GET /search?q=query` - Search devices
- `GET /compare?devices=slug1,slug2` - Compare devices
- `GET /categories` - List categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

## 🎯 Roadmap Progress

- [x] Phase 1: Project Initialization & Setup
- [ ] Phase 2: Database Design & Setup
- [ ] Phase 3: Backend Core Setup
- [ ] Phase 4: External API Integration
- [ ] Phase 5: Devices Module
- [ ] Phase 6: Categories Module
- [ ] Phase 7: Search Module
- [ ] Phase 8: Comparison Module
- [ ] Phase 9: Prices Module
- [ ] Phase 10: Frontend Setup
- [ ] Phase 11: Frontend Core Components
- [ ] Phase 12: Frontend Pages Implementation
- [ ] Phase 13: Search Functionality
- [ ] Phase 14: SEO Optimization
- [ ] Phase 15: Monetization Features
- [ ] Phase 16: Admin Panel
- [ ] Phase 17: Testing
- [ ] Phase 18: Deployment Preparation
- [ ] Phase 19: Deployment
- [ ] Phase 20: Post-deployment
- [ ] Phase 21: Scaling & Optimization
- [ ] Phase 22: Marketing & Growth
- [ ] Phase 23: Advanced Features

---

**Built with ❤️ for the tech community**
