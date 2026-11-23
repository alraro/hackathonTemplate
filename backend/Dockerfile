FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.8 /uv /uvx /bin/

# true installs the `vision` extra (torch, open_clip, ...) on first boot
ARG VISION=false
ENV VISION=${VISION} \
    UV_PROJECT_ENVIRONMENT=/app/backend/.venv \
    UV_LINK_MODE=copy \
    PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/app/backend/.venv/bin:$PATH

COPY . /app/backend
RUN chmod +x /app/backend/entrypoint.sh
WORKDIR /app/backend

EXPOSE 8000
ENTRYPOINT ["/app/backend/entrypoint.sh"]
