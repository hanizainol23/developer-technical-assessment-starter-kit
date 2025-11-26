# AI Agent Instructions – Real Estate Platform

**Last Updated:** November 26, 2025 | **Project Type:** Full-stack Real Estate app (React + NestJS + PostgreSQL)

---

## Quick Architecture Overview

```
Frontend (React 18 + TypeScript + Tailwind)
    ↓ API calls (axios + interceptors)
Backend (NestJS 9 + TypeScript + TypeORM)
    ↓ queries with DatabaseService
PostgreSQL Database (3 main tables + 1 contacts table)
    ↓ Full-text search on properties, projects, lands
Dev Container (Node + Postgres inside Docker)
```

**Key Folders:**
- `Projects/backend/` — NestJS app with modules: `auth`, `listings`, `contacts`, `properties`, `projects`, `lands`, `health`
- `Projects/frontend/` — React app with pages: `HomePage` (search), `DetailPage` (property view)
- `Projects/database/script.sql` — Single source of truth for schema, indexes, triggers, seed data
- `.devcontainer/` — Docker + docker-compose config

---

## Critical Architectural Patterns

### 1. Search Architecture (Homepage)
**Flow:** User enters keyword + location → `listingsApi.search()` → `GET /listings/search?q=...&location=...` → Service queries UNION of 3 tables → Returns mixed `type: 'property' | 'project' | 'land'`.

**Key Implementation Details:**
- `ListingsService.search()` sanitizes input, builds dynamic WHERE clause, executes UNION query across properties/projects/lands
- Frontend filters results client-side by type to display in separate sections (when not searching, displays "Popular Listings" instead)
- Search uses LIKE-based queries on indexed columns: `name`, `location_city`, `location_neighborhood`, `details`
- Database maintains `search_vector` tsvector for full-text search optimization (triggers auto-update on INSERT/UPDATE)

**Example Query Pattern** (from `ListingsService.search()`):
```sql
SELECT id, 'property' as type, name, price, image_urls, location_city, location_neighborhood, sq_ft_or_area
FROM properties
WHERE (LOWER(name) LIKE $1 OR LOWER(details) LIKE $1) AND (LOWER(location_city) LIKE $2 OR LOWER(location_neighborhood) LIKE $2)
UNION ALL
-- same for projects and lands
ORDER BY created_at DESC LIMIT $1
```

### 2. Security & Authentication
**JWT + HTTP-Only Cookies:**
- `AuthService` validates email/password, hashes with bcrypt, signs JWT with 1-hour expiry
- Token stored in **HTTP-only cookie** (JavaScript-inaccessible) for CSRF/XSS protection
- Frontend sends requests with `withCredentials: true`; backend sets `credentials: true` in CORS

**Global Protection Stack** (in `main.ts`):
- `helmet()` — Sets security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- `ValidationPipe` — DTO validation with `whitelist: true, forbidNonWhitelisted: true`
- Two rate limiters: global (100 req/15min) + auth endpoints (5 req/15min)
- `HttpExceptionFilter` — Centralized error response formatting (no stack traces in production)

**Password Validation** (in `AuthService.validatePassword()`):
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 digit
- Throws `BadRequestException` with user-friendly message

### 3. Error Handling Flow
**API Client Interceptors** (in `api/client.ts`):
- 401 → Redirect to `/login?session_expired=true`
- 429 → "Too many requests" (rate limit hit)
- 4xx/5xx → User-friendly message from backend or generic fallback
- Network errors → "Network error. Please check your connection."

**Frontend Components:**
- `ErrorBoundary` wraps entire app for React errors
- Pages catch async API errors and display via UI state (error message + recovery button)
- "Back to Popular Listings" button resets search and reloads initial state

---

## How to Extend Common Features

### Adding a New Search Filter
1. **Database:** Add indexed column to relevant table (e.g., `property_type TEXT` on properties)
2. **Backend:** Update `ListingsService.search()` WHERE clause to include new filter
3. **API:** Add query param to `GET /listings/search?q=...&location=...&property_type=...`
4. **Frontend:** Add input field to HomePage search form, pass to `listingsApi.search()`

### Adding a New Module/Endpoint
1. **NestJS pattern:** Create `src/new-feature/` folder with:
   - `new-feature.module.ts` — imports `DatabaseModule`, declares controller + service
   - `new-feature.controller.ts` — `@Controller('endpoint')` with route decorators
   - `new-feature.service.ts` — business logic using `DatabaseService`
   - `dto/` subfolder for validation classes
2. **Import in `app.module.ts`** in the `imports` array
3. **Test with:** `npm run test` (Jest configured in `package.json`)

### Modifying Database Schema
1. **Edit `Projects/database/script.sql`**
2. **Inside devcontainer, reapply:**
   ```bash
   psql -h db -p 5432 -U postgres -d postgres -f /workspace/Projects/database/script.sql
   ```
3. **Update TypeORM entities** in `src/entities/` if needed (or enable `synchronize: true` in dev, but leave `false` in prod)

---

## Build & Run Commands

### Dev Container (Recommended)
```bash
# Inside container terminal
cd /workspace/Projects/database
psql -h db -p 5432 -U postgres -d postgres -f /workspace/Projects/database/script.sql

# Terminal 1: Backend
cd /workspace/Projects/backend
npm install
npm run start:dev  # Watches for changes, recompiles on save

# Terminal 2: Frontend
cd /workspace/Projects/frontend
npm install
npm run start  # Opens browser at http://localhost:3000
```

### Local Machine (No Container)
```bash
# Requires Node.js LTS + PostgreSQL running locally
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres"
export NODE_ENV="development"

# Backend
cd Projects/backend
npm install
npm run start:dev

# Frontend (new terminal)
cd Projects/frontend
npm install
npm run start
```

### Production Build
```bash
# Backend
cd Projects/backend
npm run build
node dist/main.js

# Frontend
cd Projects/frontend
npm run build
# Deploy the `build/` folder to static host or CDN
```

---

## Critical Environment Variables

### Backend (`.env` or export before running)
```bash
DATABASE_URL=postgres://postgres:postgres@db:5432/postgres  # devcontainer
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres  # local
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-prod
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend (`.env.local`)
```bash
REACT_APP_API_URL=http://localhost:3000
```

---

## Key File Reference

| File | Purpose |
|------|---------|
| `Projects/backend/src/listings/listings.service.ts` | Search & popular endpoints logic |
| `Projects/backend/src/listings/listings.controller.ts` | `GET /listings/search` and `GET /listings/popular` routes |
| `Projects/backend/src/auth/auth.service.ts` | JWT signing, password validation, user registration |
| `Projects/backend/src/main.ts` | Security headers, CORS, rate limiters, validation pipe |
| `Projects/backend/src/filters/http-exception.filter.ts` | Centralized error response formatting |
| `Projects/frontend/src/api/client.ts` | Axios instance, interceptors, API helper functions |
| `Projects/frontend/src/pages/HomePage.tsx` | Search form, listing grid, state management |
| `Projects/database/script.sql` | Schema (properties, projects, lands, contacts), indexes, triggers |

---

## Testing Patterns

### Backend Unit Tests
```bash
cd Projects/backend
npm run test
```
Tests live in `src/**/*.spec.ts`. Framework: Jest. Example:
```typescript
describe('ListingsService', () => {
  it('should search by keyword', async () => {
    const result = await service.search('luxury', '', 10);
    expect(result).toHaveLength(1);
    expect(result[0].name).toContain('Luxury');
  });
});
```

### E2E Tests
```bash
npm run test:e2e  # if configured
```
Tests in `test/**/*.e2e-spec.ts`. Example pattern:
```typescript
describe('Listings (e2e)', () => {
  it('GET /listings/search?q=luxury should return matches', async () => {
    return request(app.getHttpServer())
      .get('/listings/search?q=luxury')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
      });
  });
});
```

---

## Common Gotchas & Fixes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| "Cannot find module 'database.service'" | DatabaseService not imported in module | Add `DatabaseModule` to the `imports` array in your module |
| Frontend gets 401 on protected endpoints | JWT cookie not sent or expired | Check `withCredentials: true` in axios config; redirect to login on 401 |
| Search returns no results | DB not seeded or search query too specific | Verify `script.sql` has INSERT statements; test query with `psql` |
| Port 3000 already in use | Another process running on that port | `lsof -i :3000` then `kill -9 <PID>` |
| "CORS not allowed" error | Origin not in `ALLOWED_ORIGINS` env var | Update env var or add origin to whitelist in `main.ts` CORS config |

---

## Code Style & Conventions

- **Naming:** Modules use PascalCase (`.module.ts`), services use PascalCase (`.service.ts`), controllers use PascalCase (`.controller.ts`)
- **NestJS Decorators:** Always use `@Controller('path')`, `@Get()`, `@Post()`, etc. for clarity
- **Frontend Components:** Use React Functional Components with hooks; keep components under ~200 lines; extract logic to custom hooks if reused
- **Error Messages:** Return user-friendly strings from services; backend filters validation errors through `HttpExceptionFilter`
- **SQL:** Use parameterized queries (`$1`, `$2`, etc.) to prevent SQL injection; maintain single `script.sql` file

---

## Resources & Documentation

- **Project Docs:**
  - `GETTING_STARTED.md` — Setup instructions for first-time users
  - `SEARCH_BAR_IMPLEMENTATION.md` — Detailed search feature design
  - `SECURITY_QUICK_START.md` — Security features overview
  - `FINAL_PRODUCT_OVERVIEW.md` — UI mockups and features checklist

- **External Docs:**
  - [NestJS Modules](https://docs.nestjs.com/modules)
  - [TypeORM Queries](https://typeorm.io/select-query-builder)
  - [React Hooks](https://react.dev/reference/react)
  - [Tailwind CSS](https://tailwindcss.com)

---

## Questions for the Repository Owner (if extending)

- **Deployment:** Where is this app deployed? What are production DB credentials?
- **Image Storage:** Are `sample data/images/` URLs hardcoded or do they reference a CDN/S3?
- **Feature Parity:** Are there additional endpoints not yet documented here (e.g., property details, agent contacts)?
- **Testing Requirements:** Are there specific test coverage targets or CI/CD checks that block merges?
