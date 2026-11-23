import uuid
from pathlib import Path

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import select

from backend.api.core.deps import SessionDep
from backend.api.core.features import enabled
from backend.api.resources.auth.deps import current_user, current_user_optional
from backend.api.resources.auth.models import User
from backend.api.resources.files.models import File, FileRead

router = APIRouter(prefix="/api/files", tags=["files"])

UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
MAX_BYTES = 20 * 1024 * 1024


def _files_user(optional: Annotated[User | None, Depends(current_user_optional)]) -> User | None:
    """Login required when Feature `auth` is on; anonymous (owner_id None) otherwise."""
    return current_user(optional) if enabled("auth") else optional


CurrentUser = Annotated[User | None, Depends(_files_user)]

# Types a browser can render without running script. Everything else downloads.
INLINE_MIMES = {"application/pdf", "image/png", "image/jpeg", "image/gif", "image/webp"}
INLINE_PREFIXES = ("audio/",)


def _read(f: File) -> FileRead:
    return FileRead(**f.model_dump(exclude={"path"}), url=f"/api/files/{f.id}/raw")


def _owned(session: SessionDep, file_id: int, user: User | None) -> File:
    f = session.get(File, file_id)
    if f is None or (user is not None and f.owner_id != user.id and user.role != "admin"):
        raise HTTPException(404, "File not found")
    return f


@router.post("", name="create", status_code=201)
def create(
    session: SessionDep, user: CurrentUser, file: UploadFile, ingest: bool = False
) -> FileRead:
    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File exceeds the 20 MB limit")
    name = Path(file.filename or "upload").name
    rel = f"{uuid.uuid4().hex}{Path(name).suffix}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / rel).write_bytes(data)
    f = File(
        name=name,
        mime=file.content_type or "application/octet-stream",
        size=len(data),
        path=rel,
        owner_id=user.id if user else None,
    )
    session.add(f)
    session.commit()
    session.refresh(f)
    if ingest:
        if not enabled("rag"):
            raise HTTPException(501, "RAG is not available")
        # >>> module:llm
        from backend.llm import rag

        rag.ingest_file(UPLOAD_DIR / rel, f.name)
        return _read(f)
        # <<< module:llm
        raise HTTPException(501, "RAG is not available")  # reached only when llm is pruned
    return _read(f)


@router.get("", name="list")
def list_files(session: SessionDep, user: CurrentUser) -> list[FileRead]:
    q = select(File).order_by(File.id)
    if user is not None and user.role != "admin":
        q = q.where(File.owner_id == user.id)
    return [_read(f) for f in session.exec(q)]


@router.get("/{file_id}", name="get")
def get(session: SessionDep, user: CurrentUser, file_id: int) -> FileRead:
    return _read(_owned(session, file_id, user))


@router.get("/{file_id}/raw", name="raw", response_class=FileResponse)
def raw(session: SessionDep, file_id: int) -> FileResponse:
    # Public on purpose: <img src> and <audio src> cannot send a bearer token.
    f = session.get(File, file_id)
    if f is None or not (UPLOAD_DIR / f.path).is_file():
        raise HTTPException(404, "File not found")
    # The mime is client-supplied: only a safe allowlist renders inline, the rest downloads (no stored XSS).
    mime = f.mime.split(";")[0].strip().lower()
    inline = mime in INLINE_MIMES or mime.startswith(INLINE_PREFIXES)
    return FileResponse(
        UPLOAD_DIR / f.path,
        media_type=mime if inline else "application/octet-stream",
        filename=f.name,
        content_disposition_type="inline" if inline else "attachment",
        headers={"X-Content-Type-Options": "nosniff"},
    )


@router.delete("/{file_id}", name="delete", status_code=204)
def delete(session: SessionDep, user: CurrentUser, file_id: int) -> None:
    f = _owned(session, file_id, user)
    (UPLOAD_DIR / f.path).unlink(missing_ok=True)
    session.delete(f)
    session.commit()
