---
module: api
lane: api
requires: []
profile: api
# api is the backend root: pruning it (only possible with llm and data) removes the whole backend.
paths:
  - backend/api
  - backend/Dockerfile
  - backend/__init__.py
  - backend/entrypoint.sh
  - backend/openapi.json
  - backend/pyproject.toml
  - backend/uv.lock
keep_when:
  - the product needs persistence, accounts or server-side logic
  - a Gate or Rubric asks for a real backend
features:
  - id: auth
    gives: users, JWT login, demo users
    entry: backend/api/resources/auth
    keep_when: the product has accounts or roles
  - id: crud
    gives: example resource and items CRUD template
    entry: backend/api/resources/items
    keep_when: the product stores user-visible records
  - id: upload
    gives: local file uploads with static URLs
    entry: backend/api/resources/files
    keep_when: users add files or images
  - id: realtime
    gives: WebSocket pub/sub, presence, notify()
    entry: backend/api/resources/ws
    keep_when: a Beat needs live updates
---

# api

FastAPI + SQLModel + Postgres. You own `backend/api/`; Web and Mobile consume the generated client, so the Contract is `backend/openapi.json`.

## Commands

Run `make help` for the rest. Done when `make check` is green.

| Command | What | When |
| --- | --- | --- |
| `make up only=api` | start the stack for this Module | begin work |
| `make seed` | load every `resources/*/seed.json` | after `up` or `db-reset` |
| `make db-reset` | drop and recreate tables, then seed | models changed, migrations messy |
| `make openapi api-client` | export `openapi.json`, regenerate the typed client and fixtures | after any route or schema change |
| `make fake resource=<id> n=20` | rewrite that resource's `seed.json` with fake rows | the UI needs data |
| `make simulate scenario=<name>` | stream rows from `scenarios/<name>.yaml` over realtime | demo a live view |
| `make add-py pkg=<name>` | add a Python package | instead of `pip install` |
| `make logs svc=backend` | follow backend logs | debug a request |
| `make check` | all repo checks, incl. stale `openapi.json` | before every commit |

`seed` and `db-reset` are stubs on main (they call modules that do not exist). Run `docker compose exec backend python -m backend.api.seed_cli` (add `--reset` to drop tables first) until the Makefile is fixed.

## Add an endpoint

1. Copy `resources/_example/` to `resources/<name>/`; rename `Example` and `_example` in `models.py`, `router.py`, `seed.json`. Done when no `_example` or `Example` remains in the copy.
2. Define the models in `models.py`: `Base` (client fields), the `table=True` class (server fields), `Create`, `Read`, `Update`. `Read` is also the `seed.json` row shape.
3. Register the router in `core/app.py`, inside `# >>> routers`: one import, one `include_router`, each ending `# module:api`. Gate it on a Feature if it has one. Registration files are ownerless: during a hackathon, file a Router intake.
4. Fill `seed.json` with rows without `id` (or `make fake resource=<name>`). Done when `make seed` reports your rows.
5. Run `make openapi api-client`. Done when `/api/docs` lists the route and `git diff` shows the regenerated `openapi.json` and client.

## Conventions

- Prefix every route with `/api`; tag = resource name; `name=` on each route sets the operationId `<tag>_<name>`, which names the generated client function.
- Write sync endpoints. Use `async` only for streaming (WebSocket, SSE).
- Annotate each return type: it becomes the response schema.
- Raise `HTTPException`; clients see `{detail}`.
- Call external APIs with `fetch_json` (`core/fetch.py`): cached on disk, `HTTP_OFFLINE=1` serves the cache when venue wifi fails.
- Push live updates with `publish(topic, data)` from `resources/ws/hub.py`, sync and thread-safe; `notify(user_id, title, body)` targets one user.
- Protect routes with `CurrentUser`, `OptionalUser` or `AdminUser` from `resources/auth/deps.py`.
- Contract change protocol: an additive change is yours as producer Lane (`make openapi api-client`, then a Change log line in `hackathon/08-contracts.md`); a breaking change (rename, remove, retype) stops you: ask the human.

## Features

Switch on in `features.json`, then `make sync`.

| Feature | Entry | Switch on when |
| --- | --- | --- |
| `auth` | `resources/auth` | the product has accounts or roles; demo users `ana@example.com`, `luis@example.com` |
| `crud` | `resources/items` | the product stores user-visible records; copy it for your own resource |
| `upload` | `resources/files` | users add files or images; served at `/api/files/{id}/raw` |
| `realtime` | `resources/ws` | a Beat needs live updates; socket at `/api/ws?token=<JWT>`, topics are free-form |

## Discarded, ready to add

Starting points, not recommendations. They are not Catalog pieces; nothing here is installed or tested. Each ends on the same completion criterion: `make openapi api-client` is clean and the flow works in the UI.

| Idea | Use when | Install | Recipe |
| --- | --- | --- | --- |
| Mocked payments | the Beat needs a checkout | none for a fake; `make add-py pkg=stripe` for Stripe test mode | 1. Resource `orders` (status, amount). 2. `POST /api/orders/{id}/pay` flips status; Stripe: create a test-mode PaymentIntent with a `sk_test_` key from `.env`. 3. `publish("orders", ...)` on change. 4. Web shows a fake card form. |
| Email mock | the Beat sends email | `axllent/mailpit` service in `docker-compose.yml`; `make add-py pkg=aiosmtplib` | 1. Add the service (SMTP 1025, UI 8025). 2. `send_email()` helper in `core/`. 3. Call it from a route. 4. Read the mail in the Mailpit UI. |
| Admin panel | an operator manages records | none | 1. Feature `auth` + `crud` on. 2. Guard routes with `AdminUser`. 3. Admin list and edit over the existing CRUD. 4. Web page gated on `role == "admin"`. |
| Gamification | points, badges, leaderboard | none | 1. Resource `points` (user_id, amount, reason). 2. `award()` helper called by other routes. 3. `GET /api/leaderboard` (sum, group by user). 4. `publish("leaderboard", ...)` on award. |
| Calendar / bookings | slots reserved by users | none | 1. Resource `slots` (start, end, user_id nullable). 2. `POST /api/slots/{id}/book` returns 409 if taken. 3. Seed future slots. 4. `publish("slots", ...)`. |
| User-to-user chat | people message each other | none (`realtime` + `crud`) | 1. Resource `messages` (room, user_id, text). 2. `POST` stores then `publish(f"room:{room}", msg)`. 3. Clients subscribe to the room topic. 4. `GET` loads history. |
| Real push notifications | alerts reach a closed app | `make add-py pkg=pywebpush` (web) or Expo push API (mobile) | 1. Resource `push_tokens` per user. 2. Extend `notify()` to also send the push. 3. Generate VAPID keys into `.env`. 4. Client registers its token. |
| Server-side PDF | downloadable report or ticket | `make add-py pkg=weasyprint` | 1. Render HTML with a template. 2. `HTML(string=...).write_pdf()`. 3. Return `Response(media_type="application/pdf")`. 4. Web links to the route. |
| Social sharing / OG images | shared links need a preview | none (Pillow ships with the stack) or `make add-py pkg=pillow` | 1. `GET /api/og/{id}.png` draws title on a template. 2. Serve HTML with `og:` meta tags. 3. Share the HTML URL. |
| AI image generation | the Beat creates images | provider SDK via `make add-py pkg=<sdk>`, key in `.env` | 1. Route `POST /api/images` calls the provider. 2. Save bytes under `uploads/` like `resources/files`. 3. Return the file URL. 4. Cache by prompt to save quota. |
