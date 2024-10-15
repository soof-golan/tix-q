_default: help

PRISMA=bunx prisma
VENV_ACTIVATE=source ./server/.venv/bin/activate
VENV_RUN=$(VENV_ACTIVATE) && dotenv run

.PHONY: migrate_dev
migrate_dev:
	$(PRISMA) migrate dev

.PHONY: migrate_deploy
migrate_deploy:
	$(PRISMA) migrate deploy

.PHONY: server
server: db
	$(VENV_RUN) uvicorn 'server.main:app' --reload

.PHONY: frontend
frontend: db
	cd website && bun run preview

.PHONY: db
db:
	docker compose up cockroachdb --detach


.PHONY: help
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  migratedev: Run prisma migrate dev"
	@echo "  migratedeploy: Run prisma migrate deploy"
	@echo "  server: Run the server"
	@echo "  frontend: Run the frontend in preview mode"
