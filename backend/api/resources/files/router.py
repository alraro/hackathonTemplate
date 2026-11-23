import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import select

from backend.api.core.deps import SessionDep
from backend.api.resources.auth.deps import CurrentUser
from backend.api.resources.files.models import File, FileRead

router = APIRouter(prefix="/api/files", tags=["files"])

UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
MAX_BYTES = 20 * 1024 * 1024


def _read(f: File) -> FileRead:
    return FileRead(**f.model_dump(exclude={"path"}), url=f"/api/files/{f.id}/raw")


def _owned(session: SessionDep, file_id: int, user: CurrentUser) -> File:
    f = session.get(File, file_id)
    if f is None or (f.owner_id != user.id and user.role != "admin"):
        raise HTTPException(404, "File not found")
    return f


@router.post("", status_code=201)
async def create(
    session: SessionDep, user: CurrentUser, file: UploadFile, ingest: bool = False
) -> FileRead:
    data = await file.read(MAX_BYTES + 1)
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
        owner_id=user.id,
    )
    session.add(f)
    session.commit()
    session.refresh(f)
    if ingest:
        try:
            from backend.llm import rag  # llm pruned -> ImportError -> 501
        except ImportError:
            raise HTTPException(501, "RAG is not available") from None
        rag.ingest_file(UPLOAD_DIR / rel, f.name)
    return _read(f)


@router.get("", name="list")
def list_files(session: SessionDep, user: CurrentUser) -> list[FileRead]:
    q = select(File).order_by(File.id)
    if user.role != "admin":
        q = q.where(File.owner_id == user.id)
    return [_read(f) for f in session.exec(q)]


@router.get("/{file_id}")
def get(session: SessionDep, user: CurrentUser, file_id: int) -> FileRead:
    return _read(_owned(session, file_id, user))


@router.get("/{file_id}/raw", response_class=FileResponse)
def raw(session: SessionDep, file_id: int) -> FileResponse:
    # Public on purpose: <img src> and <audio src> cannot send a bearer token.
    f = session.get(File, file_id)
    if f is None or not (UPLOAD_DIR / f.path).is_file():
        raise HTTPException(404, "File not found")
    return FileResponse(UPLOAD_DIR / f.path, media_type=f.mime, filename=f.name)


@router.delete("/{file_id}", status_code=204)
def delete(session: SessionDep, user: CurrentUser, file_id: int) -> None:
    f = _owned(session, file_id, user)
    (UPLOAD_DIR / f.path).unlink(missing_ok=True)
    session.delete(f)
    session.commit()
