"""Streaming chat over WebSocket `/api/llm/chat/ws` (no SSE: it breaks behind quick tunnels).

Send `{messages, use_rag?}`; receive `{type: delta, text}`* then `{type: done, citations}`
or `{type: error, detail}`. Send `{type: stop}` (or close the socket) to cancel an answer.
One socket serves many questions, one at a time. Auth: `?token=<JWT>`, required when
Feature `auth` is on, like `/api/ws`.

The sync `chat()` generator runs whole in one worker thread and feeds an asyncio queue;
a stop flag, checked between chunks, ends it and closes the provider stream.
"""
import asyncio
import logging
import threading
from typing import Any

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, ValidationError

from backend.api.resources.auth.security import decode_token
from backend.api.resources.chat.models import (
    ChatError,
    ChatFrames,
    ChatRequest,
    Citation,
    Delta,
    Done,
    Stop,
    client_frame,
)
from backend.llm.errors import LLMError

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/llm/chat", tags=["chat"])

_END = object()  # queue sentinel: the worker finished (normally or not)


def _feature(name: str) -> bool:
    from backend.api.core.app import FEATURES  # lazy: app imports this router

    return bool(FEATURES.get(name))


def _citations(req: ChatRequest) -> list[Citation]:
    """Chunks `chat(use_rag=True)` grounds on: the same `search` of the last user message."""
    from backend.llm import rag

    query = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
    return [Citation(**vars(c)) for c in rag.search(query)]


def _worker(req: ChatRequest, put: Any, stop: threading.Event) -> None:
    """Thread body: stream `chat()` into `put(frame)`, ending with done/error then `_END`."""
    from backend.llm.helpers import chat

    use_rag = req.use_rag and _feature("rag")
    try:
        citations = _citations(req) if use_rag else []
        stream = chat([m.model_dump() for m in req.messages], use_rag=use_rag)
        try:
            for text in stream:
                if stop.is_set():
                    return
                put(Delta(text=text))
        finally:
            stream.close()  # on stop: closes the provider's HTTP stream; nothing is cached
        put(Done(citations=citations))
    except LLMError as e:
        put(ChatError(detail=str(e)))
    except Exception:
        log.exception("chat stream failed")
        put(ChatError(detail="chat failed; see the backend logs"))
    finally:
        put(_END)


async def _send(ws: WebSocket, frame: BaseModel) -> None:
    await ws.send_json(jsonable_encoder(frame))


async def _answer(ws: WebSocket, req: ChatRequest) -> None:
    """Stream one answer; a `stop` frame or a disconnect cancels it."""
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[Any] = asyncio.Queue()
    stop = threading.Event()

    def put(item: Any) -> None:
        if not loop.is_closed():
            loop.call_soon_threadsafe(queue.put_nowait, item)

    worker = loop.run_in_executor(None, _worker, req, put, stop)
    incoming = asyncio.ensure_future(ws.receive_text())
    try:
        while True:
            outgoing = asyncio.ensure_future(queue.get())
            await asyncio.wait({outgoing, incoming}, return_when=asyncio.FIRST_COMPLETED)
            if outgoing.done():
                item = outgoing.result()
                if item is _END:
                    return
                await _send(ws, item)
                continue
            outgoing.cancel()
            raw = incoming.result()  # raises WebSocketDisconnect: the finally stops the worker
            try:
                frame = client_frame.validate_json(raw)
            except ValidationError:
                frame = None
            if isinstance(frame, Stop):
                stop.set()
                await _send(ws, Done())
                return
            await _send(ws, ChatError(detail="busy: send {type: stop} first"))
            incoming = asyncio.ensure_future(ws.receive_text())
    finally:
        stop.set()
        incoming.cancel()
        await worker  # returns at the next chunk once `stop` is set


@router.websocket("/ws")
async def chat_socket(ws: WebSocket, token: str | None = None) -> None:
    if _feature("auth") and (not token or decode_token(token) is None):
        await ws.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not authenticated")
        return
    await ws.accept()
    try:
        while True:
            raw = await ws.receive_text()
            try:
                frame = client_frame.validate_json(raw)
            except ValidationError as e:
                errs = [x for x in e.errors() if x["loc"][:1] != ("Stop",)] or e.errors()
                detail = "; ".join(f"{'.'.join(map(str, x['loc'][1:]))}: {x['msg']}" for x in errs)
                await _send(ws, ChatError(detail=detail))
                continue
            if isinstance(frame, ChatRequest):
                await _answer(ws, frame)
            # a stray `stop` with nothing streaming is a no-op
    except WebSocketDisconnect:
        pass


@router.get("/frames", status_code=status.HTTP_426_UPGRADE_REQUIRED)
def frames() -> ChatFrames:
    """Schema-only: exports the socket frames to openapi.json. Connect to `/ws` instead."""
    raise HTTPException(status.HTTP_426_UPGRADE_REQUIRED, "connect to /api/llm/chat/ws")
