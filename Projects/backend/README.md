# Backend (NestJS) - Minimal scaffold

Run inside the devcontainer:

```bash
cd Projects/backend
npm install
npm run start:dev
```

Environment:
- `DATABASE_URL` (optional) - defaults to `postgres://postgres:postgres@db:5432/postgres`
- `PORT` - optional server port

Security defaults are enabled in `src/main.ts` (helmet, CORS, ValidationPipe).

Tests
-----
Integration tests use `supertest` and expect the backend to be running on `http://localhost:3000` and the DB to be available.

Run tests:

```bash
# ensure DB and server are running (e.g. `make db-reset` and `npm run start:dev` in another shell)
npm test
```

These tests perform register/login and post to `/agent-contact` (requires DB write access).
