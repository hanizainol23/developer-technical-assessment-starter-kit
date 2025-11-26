# Real Estate Platform – Technical Assessment

This repository contains my solution for the **Oman Housing Bank – Developer Technical Assessment**.  
The project is a full-stack Real Estate landing page and property details view built with:

- **Frontend:** React + TypeScript  
- **Backend:** NestJS + TypeScript  
- **Database:** PostgreSQL  
- **Containerization / Dev Env:** VS Code Dev Container + Docker

---

## 1. Repository Structure

```text
.
├── .devcontainer/
│   ├── devcontainer.json        # VS Code Dev Container configuration
│   ├── docker-compose.yml       # Postgres service and dev container config
│   └── Dockerfile               # Image used by the Dev Container
├── .vscode/
│   └── settings.json
├── Projects/
│   ├── backend/                 # NestJS backend API project
│   ├── frontend/                # React frontend project
│   └── database/
│       └── script.sql           # DB schema, indexes, seed data
├── sample data/
│   └── images/
│       ├── lands/
│       │   ├── land1.jpg
│       │   └── land2.jpg
│       ├── projects/
│       │   ├── project1.jpg
│       │   └── project2.jpg
│       └── properties/
│           ├── property1.jpg
│           └── property2.jpg
└── README.md
```

**Put each component in these folders:**
- Backend project → `Projects/backend`
- Frontend project → `Projects/frontend`
- Database scripts → `Projects/database/script.sql`
- Sample images → `sample data/images/...`

---

## 2. Prerequisites

### Recommended (Dev Container)
- Docker Desktop  
- Visual Studio Code  
- Dev Containers extension  

### If not using containers
- Node.js (LTS)
- npm or yarn
- PostgreSQL installed manually

---

## 3. Environment Setup (Using VS Code Dev Container)

1. **Clone your fork** of the repository:

   ```bash
   git clone https://github.com/Oman-Housing-Bank-SAOC/developer-technical-assessment-starter-kit.git

   cd developer-technical-assessment-starter-kit
   ```


2. Open the folder in Visual Studio Code.
3. Press Ctrl+Shift+P → select:
```
Dev Containers: Reopen in Container
```
Database connection inside the Dev Container

Use the following credentials:

| Key      | Value    |
|----------|----------|
| Host     | db       |
| Port     | 5432     |
| User     | postgres |
| Password | postgres |
| Database | postgres |

## 4. Database Setup

All SQL scripts have to be located in:
```
Projects/database/script.sql
```

This file should includes:
1. Table creation
2. Indexes
3. Sample seed data (projects, lands, properties, users, contacts.. etc) 

## 5. Run / Start (devcontainer)

1. Open the repo in VS Code and select `Dev Containers: Reopen in Container`.
2. From inside the devcontainer shell, apply the DB schema:

```bash
psql -h db -p 5432 -U postgres -d postgres -f /workspace/Projects/database/script.sql
```

3. Start the backend (if present):

```bash
cd Projects/backend
npm install
npm run start:dev
```

4. Start the frontend (if present):

```bash
cd Projects/frontend
npm install
npm run start
```

## Security defaults (backend guidance)

- Use `helmet` to set secure HTTP headers.
- Enable CORS with an explicit origin whitelist; do not use a permissive wildcard in production.
- Use input validation (NestJS `ValidationPipe` or `express-validator`) and enable whitelist/forbidNonWhitelisted options when possible.
- Add rate limiting middleware (e.g., `express-rate-limit`) to public endpoints like contact forms and auth.
- Run with `NODE_ENV=production` in production and keep secrets in environment variables.

