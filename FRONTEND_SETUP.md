# Frontend Setup & Launch Guide

## What Was Created

The React frontend has been fully scaffolded with the following structure:

### Page Components
- **`src/pages/HomePage.tsx`** — Landing page that:
  - Fetches popular listings from `/listings/popular?limit=6`
  - Displays hero section with search bar
  - Renders three sections: Featured Properties, Projects, and Lands
  - Uses `ListingCard` component in responsive grid (3 columns on desktop)

- **`src/pages/DetailPage.tsx`** — Property/Project/Land detail page that:
  - Extracts `:type` and `:id` from URL params (e.g., `/property/5`, `/project/3`, `/land/1`)
  - Fetches listing details from backend (`/property/:id`, `/project/:id`, `/land/:id`)
  - Displays property carousel with `PropertyCarousel` component
  - Shows name, location, price, area, and details
  - Includes a contact form (`POST /agent-contact`) with auto-registration fallback

### Reusable Components
- **`src/components/Header.tsx`** — Navigation bar with logo and links
- **`src/components/Footer.tsx`** — 3-column grid footer with About, Links, Contact sections
- **`src/components/ListingCard.tsx`** — Card component for listing display (image, name, location, price)
  - Links to `/property/:id`, `/project/:id`, `/land/:id` based on type
- **`src/components/PropertyCarousel.tsx`** — Image carousel with prev/next buttons and dot indicators

### App Structure
- **`src/App.tsx`** — React Router setup with routes:
  - `/` → HomePage
  - `/:type/:id` → DetailPage (where type is "property", "project", or "land")

- **`src/index.tsx`** — React DOM entry point
- **`src/index.css`** — Tailwind CSS imports + global styles
- **`public/index.html`** — HTML template with root div
- **`.env.local`** — Environment config (REACT_APP_API_URL=http://localhost:3000)

### API Integration
- **`src/api/client.ts`** — Axios client with endpoints:
  - `listingsApi.popular(limit)` → GET /listings/popular
  - `propertiesApi.getOne(id)` → GET /property/:id
  - `projectsApi.getOne(id)` → GET /project/:id
  - `landsApi.getOne(id)` → GET /land/:id
  - `authApi.register(email, password)` → POST /auth/register
  - `authApi.login(email, password)` → POST /auth/login
  - `agentContactApi.create(payload)` → POST /agent-contact (with JWT)

## To Complete the Setup

### Step 1: Open in VS Code Dev Container
```bash
# In VS Code: Dev Containers: Reopen in Container
# This gives you Node.js + Docker environment inside the container
```

### Step 2: Install Frontend Dependencies
```bash
cd /workspace/Projects/frontend
npm install
```

### Step 3: Ensure Backend & DB are Ready
```bash
# From workspace root (inside devcontainer)
make db-reset        # Apply schema + seed data
make backend-start   # Start NestJS server (background)
```

### Step 4: Start Frontend Dev Server
```bash
cd /workspace/Projects/frontend
npm start
```

This will open http://localhost:3000 in your browser.

## Expected Behavior

### Landing Page (/)
- Displays hero banner with "Find Your Dream Property" title
- Fetches 6 popular listings from backend
- Shows three sections (Properties, Projects, Lands) each with up to 3 items
- Clicking a card navigates to detail page (e.g., clicking a property goes to `/property/5`)

### Detail Page (/property/:id, /project/:id, /land/:id)
- Displays image carousel at top (with prev/next/dots)
- Shows listing name, location, price, area, and details
- Includes "Back to Listings" button
- Contact form to submit inquiry:
  - If user is not authenticated, auto-registers with a temporary email
  - Submits contact request to `/agent-contact` with JWT
  - Shows success/error message after submission

## Environment Variables

**Frontend (.env.local)**
```
REACT_APP_API_URL=http://localhost:3000
```

**Backend (.env — if using)**
```
DATABASE_URL=postgres://postgres:postgres@db:5432/postgres
JWT_SECRET=your-secret-here
PORT=3000
NODE_ENV=development
```

## Troubleshooting

**"npm: command not found"**
- Make sure you're running inside the VS Code Dev Container (`Dev Containers: Reopen in Container`)
- Local machine may not have Node.js installed; the devcontainer provides it

**"Cannot GET /property/:id"**
- Ensure backend is running (`make backend-start`)
- Check database is seeded (`make db-reset`)
- Verify REACT_APP_API_URL points to correct backend URL

**Images not loading on cards**
- The placeholder uses https://via.placeholder.com (requires internet)
- Fallback displays gray box with "No images available"
- Real data from DB will include image URLs (check `sample data/images/`)

**Contact form fails to submit**
- Confirm backend `/agent-contact` endpoint is working (check terminal for errors)
- Ensure database has users table (run `make db-reset`)
- Check browser console for CORS errors (backend should allow localhost:3000)

## Next Steps (Optional Enhancements)

1. **Search functionality** — Add search bar on homepage to filter listings by keyword
2. **Filters** — Price range, location, area filters on landing page
3. **Authentication UI** — Login/register pages for persistent user sessions
4. **Favorites** — Save listings to local storage or backend
5. **Maps integration** — Show property location on Google Maps
6. **Image optimization** — Lazy load carousel images, use thumbnails

---

**Note**: All TypeScript compilation errors shown in the editor before `npm install` are expected (missing React types). They will resolve once dependencies are installed.
