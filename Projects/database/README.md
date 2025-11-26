# Database helpers

This folder contains `script.sql` (schema + sample seed) and a seeding helper `seed.js` to generate larger synthetic data sets for local testing.

Run the seeder inside the devcontainer (recommended):

```bash
# from repo root (inside devcontainer)
psql -h db -p 5432 -U postgres -d postgres -f /workspace/Projects/database/script.sql
node /workspace/Projects/database/seed.js
```

If running locally, set `DATABASE_URL` to your connection string.
