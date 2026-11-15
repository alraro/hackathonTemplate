#!/bin/sh
# Dev entrypoint: sync deps only when uv.lock changed, then run uvicorn with reload.
# Any command passed by compose is ignored: the app path lives here.
set -e
cd /app/backend

extras=""
[ -d llm ] && extras="$extras --extra llm"
[ -d data ] && extras="$extras --extra data"
[ "$VISION" = "true" ] && extras="$extras --extra vision"

venv="${UV_PROJECT_ENVIRONMENT:-/app/backend/.venv}"
stamp="$venv/.lock-stamp"
want="$(sha256sum uv.lock | cut -d' ' -f1)$extras"

if [ ! -f "$stamp" ] || [ "$(cat "$stamp")" != "$want" ]; then
  # shellcheck disable=SC2086
  uv sync --frozen $extras
  echo "$want" > "$stamp"
fi

cd /app
exec uvicorn backend.api.core.app:app --host 0.0.0.0 --port 8000 --reload --reload-dir /app/backend
