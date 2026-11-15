from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute

from backend.api.core.db import create_db_and_tables
from backend.api.core.settings import settings


def generate_unique_id(route: APIRoute) -> str:
    """operationId = <tag>_<name>, e.g. items_list."""
    tag = route.tags[0] if route.tags else "default"
    return f"{tag}_{route.name}"


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="API",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    generate_unique_id_function=generate_unique_id,
    lifespan=lifespan,
)

if settings.dev:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


# >>> routers (filled by #43: add include_router calls here)
# <<< routers
