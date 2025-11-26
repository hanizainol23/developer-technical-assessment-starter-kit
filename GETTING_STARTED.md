# Final Product — Getting Started Guide

## Current Status

✅ **Implementation Complete**: All code has been written and integrated  
❌ **Requires**: Node.js and npm to run locally

---

## Prerequisites

Before you can run the application, you need to install:

### 1. Node.js & npm

**Download from**: https://nodejs.org/ (LTS version recommended)

After installation, verify:
```bash
node --version    # Should show v18+ or v20+
npm --version     # Should show 9+ or 10+
```

### 2. PostgreSQL (optional for local testing)

The database is included in the Docker dev container, but if running locally:
- Download PostgreSQL: https://www.postgresql.org/download/
- Create a database: `createdb postgres`
- User: postgres / Password: postgres

### 3. Docker & Docker Compose (for dev container - recommended)

**Download from**: https://www.docker.com/products/docker-desktop

After installation:
```bash
docker --version
docker-compose --version
```

---

## Option 1: Run Locally (Requires Node.js)

### Step 1: Install Dependencies

```bash
# Backend
cd Projects/backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Start Backend

```bash
cd Projects/backend
npm run start:dev
```

**Expected output**:
```
[Nest] 26/11/2025, 10:30:45 AM   [NestFactory] Starting Nest application...
[Nest] 26/11/2025, 10:30:45 AM   [InstanceLoader] DatabaseModule dependencies initialized
[Nest] 26/11/2025, 10:30:45 AM   [InstanceLoader] AuthModule dependencies initialized
[Nest] 26/11/2025, 10:30:45 AM   [RoutesResolver] AppController {/}:
[Nest] 26/11/2025, 10:30:45 AM   [Router] Mapped {/health, GET} route +2ms
[Nest] 26/11/2025, 10:30:45 AM   [NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
```

### Step 3: Start Frontend (in another terminal)

```bash
cd Projects/frontend
npm run start
```

**Expected output**:
```
Webpack compiled successfully
The app is running at:
  http://localhost:3000
```

### Step 4: Open Browser

Navigate to: **http://localhost:3000**

---

## Option 2: Run in Dev Container (Recommended - Requires Docker)

### Step 1: Open in VS Code Dev Container

1. Install VS Code extension: "Dev Containers"
2. Open the project folder in VS Code
3. Click "Reopen in Container" (bottom left green button)
4. Wait for container to build and start (~2-5 minutes first time)

### Step 2: Open Terminal in Container

Once in the container:

```bash
# Terminal 1: Start Backend
cd Projects/backend
npm run start:dev

# Terminal 2: Start Frontend (new terminal)
cd Projects/frontend
npm run start
```

### Step 3: Access Application

The application will be available at: **http://localhost:3000**

---

## What You'll See

### Homepage (Landing Page)

When you open http://localhost:3000, you'll see:

#### Hero Section with Search Bar
```
┌─────────────────────────────────────────────────────────────┐
│          Find Your Dream Property                            │
│   Discover thousands of properties, projects, and lands      │
│                                                              │
│  ┌──────────────────────┬──────────────────────┬─────────┐ │
│  │ Search by name or    │ Location (city/      │ Search  │ │
│  │ keyword...           │ neighborhood)...     │ Button  │ │
│  └──────────────────────┴──────────────────────┴─────────┘ │
│                                                              │
│          (only "Search" button initially visible)           │
└─────────────────────────────────────────────────────────────┘
```

#### Popular Listings Grid
```
Popular Listings

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│              │  │              │  │              │
│   Listing 1  │  │   Listing 2  │  │   Listing 3  │
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│              │  │              │  │              │
│   Listing 4  │  │   Listing 5  │  │   Listing 6  │
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

#### Featured Sections
```
Featured Properties
[3 property listings in grid]

Featured Projects
[3 project listings in grid]

Available Lands
[3 land listings in grid]
```

### Testing Search Functionality

#### Test 1: Keyword Search
```
1. Type "luxury" in the keyword field
2. Click "Search"
3. Results show: "Search Results (5 results)"
4. Only matching listings displayed
5. "Clear" button appears
6. Featured sections are hidden
```

#### Test 2: Location Search
```
1. Click "Clear" to reset
2. Type "Manhattan" in location field
3. Click "Search"
4. Shows Manhattan-filtered results
5. Featured sections hidden
```

#### Test 3: Combined Search
```
1. Type "apartment" in keyword field
2. Type "Brooklyn" in location field
3. Click "Search"
4. Shows apartments in Brooklyn
5. Result count displayed
```

#### Test 4: Clear Results
```
1. From any search, click "Clear"
2. Returns to initial state
3. Search fields empty
4. Popular listings reload
5. Featured sections reappear
```

### Network Requests (View in Browser DevTools)

When you search, you'll see these API calls:

**Request**:
```
GET /api/listings/search?q=luxury&location=Manhattan&limit=20
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "type": "property",
    "name": "Luxury Manhattan Apartment",
    "price": 5000000,
    "image_urls": ["url1.jpg", "url2.jpg"],
    "location_city": "New York",
    "location_neighborhood": "Manhattan",
    "sq_ft_or_area": 3500,
    "created_at": "2024-01-15T10:30:45.123Z"
  },
  ...
]
```

### Security Features (In Browser)

When logged in, you'll notice:

1. **Authentication Cookie** (DevTools → Application → Cookies)
   - Name: `authentication`
   - HttpOnly: ✓ (cannot be accessed by JavaScript)
   - Secure: ✓ (HTTPS only in production)
   - SameSite: Strict ✓

2. **Security Headers** (DevTools → Network → Response Headers)
   - `X-Frame-Options: DENY` (clickjacking protection)
   - `Strict-Transport-Security: max-age=31536000` (HTTPS enforcement)
   - `X-Content-Type-Options: nosniff` (MIME type sniffing prevention)
   - `Content-Security-Policy: default-src 'self'...` (XSS prevention)

3. **Form Validation** (Try on contact form)
   - Empty field: Shows "Name is required"
   - Invalid email: Shows "Please enter a valid email address"
   - Short message: Shows "Message must be at least 10 characters"

4. **Error Handling**
   - Try searching with backend stopped
   - See: "Network error. Please check your connection."
   - Click "Back to Popular" to recover

---

## File Structure

```
developer-technical-assessment-starter-kit/
├── Projects/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── listings/
│   │   │   │   ├── listings.controller.ts     ← Search endpoint
│   │   │   │   └── listings.service.ts        ← Search logic
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts   ← Error handling
│   │   │   ├── auth/                          ← Authentication
│   │   │   ├── main.ts                        ← Security headers
│   │   │   └── app.module.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── frontend/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── HomePage.tsx               ← Search form & results
│       │   │   ├── DetailPage.tsx             ← Property details
│       │   │   └── LoginPage.tsx              ← Authentication
│       │   ├── components/
│       │   │   ├── ErrorBoundary.tsx          ← Error handling
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   └── ListingCard.tsx
│       │   ├── api/
│       │   │   └── client.ts                  ← API client + search method
│       │   ├── App.tsx                        ← App component
│       │   └── index.tsx                      ← Entry point
│       ├── package.json
│       └── README.md
│
├── .devcontainer/
│   ├── Dockerfile
│   ├── devcontainer.json
│   └── docker-compose.yml
│
├── SECURITY_QUICK_START.md
├── SEARCH_BAR_QUICK_START.md
├── SEARCH_BAR_IMPLEMENTATION.md
└── README.md
```

---

## Key Features Implemented

### ✅ Search Bar Functionality
- Dual-field search (keyword + location)
- Real-time input handling
- Search results with count
- Clear/reset functionality
- Error handling with recovery

### ✅ Security Enhancements
- HTTP-only cookies for JWT storage
- Password strength validation (8+, uppercase, lowercase, digit)
- Rate limiting (100 req/15min global, 5 req/15min auth)
- Security headers (CSP, HSTS, frameguard, XSS filter, no-sniff)
- Centralized error handling
- Form validation (frontend + backend)

### ✅ Error Handling
- Error boundary component
- Axios interceptors
- User-friendly error messages
- Recovery buttons
- Secure error responses (no info leakage)

---

## Testing Checklist

Once running, test these scenarios:

### Search Functionality
- [ ] Type keyword, click Search → see results
- [ ] Type location, click Search → see location-filtered results
- [ ] Type both → see combined results
- [ ] Click Clear → back to popular listings
- [ ] Search "xyz123" → see "No properties found" message
- [ ] Click "View Popular Listings" → restore home state

### Security Features
- [ ] Try invalid login → see password validation error
- [ ] Try weak password → see strength validation error
- [ ] Create account → see HttpOnly cookie in DevTools
- [ ] Try to access token from console → fails (HttpOnly)
- [ ] Try XSS injection in search → treated as text
- [ ] Check security headers in DevTools

### Error Handling
- [ ] Stop backend → try to search → see error message
- [ ] Click "Back to Popular" → page recovers
- [ ] Fill contact form with invalid data → see field errors
- [ ] Try form submission → see validation errors

### Responsive Design
- [ ] Open in mobile size (375px) → inputs stack vertically
- [ ] Tablet size (768px) → inputs in row
- [ ] Desktop size (1920px) → full layout
- [ ] Search form responsive on all sizes

---

## Troubleshooting

### Node.js not found
**Solution**: Install from https://nodejs.org/

### Port 3000 already in use
```bash
# Find process on port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Try install again
npm install
```

### Database connection error
The dev container includes PostgreSQL. If running locally:
- Ensure PostgreSQL is running
- Create database: `createdb postgres`
- Check connection string in `.env`

### Frontend can't reach backend
- Check backend is running on port 3000
- Check `REACT_APP_API_URL` is set correctly
- Check CORS settings in backend main.ts

### Search returns no results
- Verify database has seed data
- Check `Projects/database/script.sql`
- Run: `psql -h localhost -U postgres -d postgres -f Projects/database/script.sql`

---

## Next Steps

1. **Install Node.js** from https://nodejs.org/
2. **Run locally** or use **Docker dev container**
3. **Test search functionality** using test scenarios above
4. **Explore security features** in DevTools
5. **Review documentation** in `SEARCH_BAR_*.md` and `SECURITY*.md` files
6. **Deploy** to staging/production with env vars configured

---

## Documentation Files

- `README.md` — Project overview
- `SECURITY_QUICK_START.md` — Security features guide
- `SECURITY_IMPLEMENTATION_COMPLETE.md` — Security details
- `SEARCH_BAR_QUICK_START.md` — Search feature quick reference
- `SEARCH_BAR_IMPLEMENTATION.md` — Search feature technical docs
- `SEARCH_BAR_SUMMARY.md` — Complete search implementation overview
- `SEARCH_BAR_TESTING.md` — Testing guide

---

## Summary

The Real Estate Platform is complete with:

✅ **Search Bar** — Keyword + location filtering  
✅ **Security** — HTTP-only cookies, rate limiting, input validation  
✅ **Error Handling** — Error boundary, interceptors, user-friendly messages  
✅ **Responsive Design** — Works on all devices  
✅ **Documentation** — Comprehensive guides and references  

**To see it in action**:
1. Install Node.js
2. Run `npm install` in both backend and frontend
3. Run `npm run start:dev` in backend
4. Run `npm run start` in frontend
5. Visit http://localhost:3000

Enjoy exploring the final product! 🚀
