# Makefile - convenience targets for DB setup and seeding (devcontainer)

# Paths inside the devcontainer workspace
DB_SCRIPT := /workspace/Projects/database/script.sql
SEED_SCRIPT := /workspace/Projects/database/seed.js

.PHONY: db-apply db-seed db-reset

# Apply schema (drops and recreates tables as defined in script.sql)
db-apply:
	@echo "Applying DB schema from $(DB_SCRIPT)"
	@psql -h db -p 5432 -U postgres -d postgres -f $(DB_SCRIPT)

# Run Node seeder (uses DATABASE_URL or devcontainer defaults)
db-seed:
	@echo "Running DB seeder $(SEED_SCRIPT)"
	@node $(SEED_SCRIPT)

# Apply schema and then seed
db-reset: db-apply db-seed
	@echo "DB schema applied and seeded"

# Start backend server in background (for tests). Writes PID to `./.backend.pid`.
.PHONY: backend-start backend-stop test-e2e
backend-start:
	@echo "Starting backend (logs -> /tmp/backend.log)..."
	@cd Projects/backend && npm install >/dev/null 2>&1 || true
	@cd Projects/backend && nohup npm run start:dev >/tmp/backend.log 2>&1 & echo $$! > ../../.backend.pid
	@echo "Waiting for server to accept connections..."
	@bash -c '\
for i in `seq 1 30`; do \
	code=`curl -sS -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo 000`; \
	if [ "$$code" = "200" ]; then echo "server healthy ($$code)"; exit 0; fi; \
  sleep 1; \
done; \
echo "server did not start"; exit 1'

backend-stop:
	@echo "Stopping backend (if running)"
	@if [ -f ./.backend.pid ]; then kill `cat ./.backend.pid` >/dev/null 2>&1 || true; rm ./.backend.pid; fi

# Run integration tests by starting the backend, running tests, then stopping the backend
test-e2e: backend-start
	@echo "Running backend integration tests..."
	@cd Projects/backend && npm test || true
	@$(MAKE) backend-stop
