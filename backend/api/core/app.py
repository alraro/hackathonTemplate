import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from sqlmodel import Session

from backend.api.core.db import create_db_and_tables, engine
from backend.api.core.features import FEATURES
from backend.api.core.seed import import_models, seed_all
from backend.api.core.settings import settings

log = logging.getLogger(__name__)


def generate_unique_id(route: APIRoute) -> str:
    """operationId = <tag>_<name>, e.g. items_list."""
    tag = route.tags[0] if route.tags else "default"
    return f"{tag}_{route.name}"


@asynccontextmanager
async def lifespan(_: FastAPI):
    if FEATURES.get("auth") and not settings.secret_key:
        raise RuntimeError("SECRET_KEY is empty but Feature `auth` is on. Run `make setup` (it writes one to .env).")
    import_models()
    create_db_and_tables()
    with Session(engine) as session:  # inserts only into empty tables, so restarts are harmless
        for name, n in seed_all(session).items():
            if n:
                log.info("seeded %s: %d rows", name, n)
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


# Feature gating: features.json sits at the repo root (/app in Docker).

# >>> routers
# One import + gated include per router. Prune markers: a trailing `# module:<x>` removes one line,
# so a multi-line statement (an `if` and its body) sits in a `# >>> module:<x>` block.
from backend.api.resources._example.router import router as example_router  # module:api
from backend.api.resources.auth.router import router as auth_router  # module:api
from backend.api.resources.chat.router import router as chat_router  # module:llm
from backend.api.resources.data_reports.router import router as data_reports_router  # module:data
from backend.api.resources.files.router import router as files_router  # module:api
from backend.api.resources.items.router import router as items_router  # module:api
from backend.api.resources.rag.router import router as rag_router  # module:llm
from backend.api.resources.transcribe.router import router as transcribe_router  # module:llm
from backend.api.resources.ws.router import router as ws_router  # module:api

app.include_router(example_router)  # module:api
if FEATURES.get("crud"):
    app.include_router(items_router)  # module:api
if FEATURES.get("auth"):
    app.include_router(auth_router)  # module:api
if FEATURES.get("upload"):
    app.include_router(files_router)  # module:api
if FEATURES.get("realtime"):
    app.include_router(ws_router)  # module:api
# >>> module:llm
if FEATURES.get("chat"):
    app.include_router(chat_router)
if FEATURES.get("rag"):
    app.include_router(rag_router)
if FEATURES.get("voice"):
    app.include_router(transcribe_router)
# <<< module:llm
# >>> module:data
if FEATURES.get("reports"):
    app.include_router(data_reports_router)
# <<< module:data
# <<< routers

# Global exception handler: LLMError -> 503 {detail}. Removed with the llm Module.
# >>> module:llm
from backend.llm.errors import LLMError


@app.exception_handler(LLMError)
async def llm_error_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=503, content={"detail": str(exc)})
# <<< module:llm
