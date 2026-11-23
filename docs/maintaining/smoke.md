# Smoke test

Run before each release tag, on a fresh clone (Linux; macOS/arm64 too when available). Work top to bottom; each step is done when its check passes. Paste a one-line result per step into the release PR.

## Setup

1. `git clone <repo> smoke && cd smoke && make setup`. Pick free ports in `.env` (`WEB_PORT`, `API_PORT`, `DB_PORT`) if another stack runs.
2. `cd mobile && npm ci && cd ..`, so the mobile checks run instead of warning "not implemented yet".

## Stack

3. `make doctor && make up`. Done when both exit 0 and print the web and api URLs. The first `up` installs Python deps (several minutes); the backend healthcheck waits for it.
4. `make check`. Done when it prints `OK`; only warn-only rows may warn.
5. `make help`. Done when every target shows under a section, none without a description.
6. `make db-reset`, then `make seed`. Done when both print `done` with row counts.
7. `make openapi api-client`, then `git status`. Done when nothing changed.
8. `make theme`, then `git status`. Done when nothing changed.

## Modules

9. `make data-run run=<name>` for every `backend/data/runs/_example_*.yaml`. Done when each prints a metric line. `_example_vision` fails with "needs the [vision] extra" unless `vision` is `true` in `features.json` and the backend image is rebuilt (`docker compose build backend`).
10. `make eda CSV=backend/data/datasets/wine.csv`. Done when it prints the `eda.html` path.
11. `make rag-ingest` with a `GEMINI_API_KEY` (or `EMBED_PROVIDER=ollama`). Done when it prints `ingested N chunks`. Without a key it must fail with "set `GEMINI_API_KEY` in .env".
12. `VITE_API_MODE=live` in `.env`, `make up`, open every nav entry of the web app; repeat with `fixtures`. Done when every enabled Feature screen renders data and the console shows no errors.
13. `make demo` and `make demo mode=fixtures`. Done when the printed URL serves the app (live: `/api/health` answers `ok`).
14. `make share` (manual). Done when the printed public URL opens the app on a phone.
15. `make mobile` (manual). Done when Expo Go on a phone opens the app.

## Prune

Run on a throwaway clone with `git remote remove origin`: prune deletes the `lane:<x>` GitHub labels when a remote exists.

16. For each Module (`web`, `mobile`, `llm`, `data`), then `web mobile` together and `api llm data` together:
    1. `make prune m="--dry-run <names>"`. Done when the plan lists only that Module's paths, marked blocks, extras and profiles.
    2. `make prune m="<names>"`, `make openapi api-client` (when `api` is kept), `git add -A && git commit -m prune`, then `make check`. Done when it prints `OK`.
    3. `make help`. Done when no section of a pruned Module remains.
    4. `python3 scripts/prune.py --restore <name> --sha <pre-prune sha>` for each name, then `git diff <pre-prune sha>`. Done when the diff is empty.
17. `make prune m=api` alone. Done when it refuses because `llm` and `data` require `api`.

## Wrap up

18. `python3 scripts/sync.py --check`. Done when it exits 0.
19. Open a PR. Done when CI is green (or, while Actions are unavailable, step 4 is green locally).
20. `docker compose down -v` in the smoke clone, then delete it.
