# Every target has a `## what it does — when to run it` comment (shown by `make help`).
# Prune markers: `# >>> module:<x>` ... `# <<< module:<x>` around each Module's target group.

.DEFAULT_GOAL := help
SHELL := /bin/bash

PYTHON ?= python3

-include .env
COMPOSE_PROFILES ?= web,api
WEB_PORT ?= 5173
API_PORT ?= 8000
EMBED_PROVIDER ?= gemini

# `make up only=web` starts a single profile; ollama joins when EMBED_PROVIDER=ollama.
comma := ,
PROFILES_BASE := $(if $(only),$(only),$(COMPOSE_PROFILES))
PROFILES := $(PROFILES_BASE)$(if $(filter ollama,$(EMBED_PROVIDER)),$(comma)ollama)
VISION := $(shell $(PYTHON) -c "import json;print(str(json.load(open('features.json')).get('vision',False)).lower())" 2>/dev/null || echo false)
DC := COMPOSE_PROFILES=$(PROFILES) VISION=$(VISION) docker compose

# --- core ---

.PHONY: help doctor up down restart logs ps sh clean prune check setup invite lint-docs sync share demo
help: ## list every target — run first, or when you forget a command
	@if [ -f scripts/make_help.py ]; then $(PYTHON) scripts/make_help.py; else awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z0-9_-]+:.*## / {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST); fi

doctor: ## check Docker, ports and .env — run when something does not start
	$(PYTHON) scripts/doctor.py

up: ## start the stack detached and print URLs — run to begin work (only=web for one Module)
	$(DC) up -d --wait
	@echo "web: http://localhost:$(WEB_PORT)"
	@echo "api: http://localhost:$(API_PORT)/docs"

down: ## stop the stack, keep data — run when you are done for the day
	docker compose down

restart: ## restart services (svc= for one) — run after changing env or compose
	docker compose restart $(svc)

logs: ## follow logs (svc= for one) — run to debug a service
	docker compose logs -f --tail=100 $(svc)

ps: ## list running services and health — run to see what is up
	docker compose ps

sh: ## shell into a service (svc=backend by default) — run to poke around inside
	docker compose exec $(or $(svc),backend) sh

clean: ## remove containers AND volumes after y/N confirm — run to reset all data
	@read -r -p "This deletes the database and node_modules volumes. Continue? [y/N] " a; \
	if [ "$$a" = "y" ] || [ "$$a" = "Y" ]; then docker compose down -v; else echo "aborted"; fi

prune: ## remove a Module: m=<name> [or m="--dry-run <name>"] — run once at the Prune phase
	$(PYTHON) scripts/prune.py $(m)

check: ## run all repo checks — run before every commit and PR
	$(PYTHON) scripts/check.py

setup: ## create .env and SECRET_KEY — run once after cloning
	$(PYTHON) scripts/setup.py

invite: ## print teammate invite steps — run when adding a teammate
	$(PYTHON) scripts/setup.py invite $(users)

lint-docs: ## lint MODULE.md and docs — run after editing docs
	$(PYTHON) scripts/lint_docs.py

sync: ## regenerate catalog and derived files — run after adding a Module or Feature
	$(PYTHON) scripts/sync.py

share: ## expose the stack on a public URL (via=ngrok optional) — run to demo from your phone
	$(PYTHON) scripts/share.py

demo: ## switch to demo mode with seeded data — run before presenting
	$(PYTHON) scripts/demo.py

# >>> module:api
# --- api ---
.PHONY: seed db-reset openapi fake simulate add-py
seed: ## load seed data into the database — run after db-reset or first up
	docker compose exec backend python -m backend.api.seed_cli

db-reset: ## drop and recreate tables, then seed — run when models changed or migrations get messy
	docker compose exec backend python -m backend.api.seed_cli --reset

openapi: ## export backend/openapi.json — run after changing API routes
	docker compose run --rm -T backend python -m backend.api.openapi

fake: ## regenerate seed.json with fake rows: resource= [n=20] — run to fill the UI with data
	docker compose exec backend python -m backend.api.fake --resource $(resource) --n $(or $(n),20)

simulate: ## stream simulated rows over realtime: scenario= — run to demo live dashboards
	docker compose exec backend python -m backend.api.simulate --scenario $(scenario)

add-py: ## add a Python package: pkg= [extra=] — run instead of pip install
	docker compose exec backend uv add $(if $(extra),--optional $(extra)) $(pkg)
# <<< module:api

# >>> module:web
# --- web ---
.PHONY: api-client design-lint theme add-web
api-client: ## regenerate the typed API client and fixtures — run after make openapi
	$(PYTHON) scripts/api_client.py

design-lint: ## check design tokens and contrast (warn-only) — run after editing theme.json
	docker compose exec web npm run design-lint

theme: ## regenerate design tokens for web, mobile, pitch — run after editing theme.json
	docker compose run --rm -T --no-deps $(foreach d,mobile pitch,$(if $(wildcard $(d)/),-v ./$(d):/$(d))) web npm run theme

add-web: ## add an npm package: pkg= — run instead of npm install
	docker compose exec web npm install $(pkg)
# <<< module:web

# >>> module:llm
# --- llm ---
.PHONY: rag-ingest
rag-ingest: ## embed docs into pgvector — run after adding documents to ingest
	docker compose exec backend python -m backend.llm.rag ingest
# <<< module:llm

# >>> module:data
# --- data ---
.PHONY: data-run eda
data-run: ## run a data pipeline: run= — run to produce reports and models
	docker compose exec backend python -m backend.data run $(run)
eda: ## explore a dataset with skrub TableReport: CSV= — run before choosing a pipeline
	docker compose exec backend python -m backend.data eda $(CSV)
# <<< module:data

# >>> module:mobile
# --- mobile ---
.PHONY: mobile mobile-tunnel
mobile: ## start Expo on the LAN — run to test on a phone on the same wifi
	$(PYTHON) scripts/mobile.py

mobile-tunnel: ## start Expo through a tunnel — run when the phone is on another network
	$(PYTHON) scripts/mobile.py --tunnel
# <<< module:mobile

# >>> module:pitch
# --- pitch ---
.PHONY: slides slides-pdf
slides: ## serve the Slidev deck — run to edit the pitch
	cd pitch && npm install --no-audit --no-fund && npx slidev

slides-pdf: ## export the deck to PDF — run before submitting
	cd pitch && npm install --no-audit --no-fund && npx slidev export --output slides-export.pdf
# <<< module:pitch
