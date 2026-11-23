"""WebSocket `/api/ws` plus a sync HTTP publish for scripts (`make simulate`).

Auth: `?token=<JWT>`. Required when Feature `auth` is on; anonymous otherwise.
With auth on, a client may only subscribe to its own `notifications:<user_id>`
and may not publish on any `notifications:` topic (use `notify()` server-side).
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import ValidationError

from backend.api.core.features import enabled
from backend.api.resources.auth.deps import OptionalUser
from backend.api.resources.auth.security import decode_token
from backend.api.resources.ws.hub import hub, publish
from backend.api.resources.ws.models import (
    NOTIFICATIONS_PREFIX,
    Publish,
    PublishRequest,
    ServerMessage,
    Subscribe,
    client_message,
)

router = APIRouter(prefix="/api/ws", tags=["ws"])


def _auth_on() -> bool:
    return enabled("auth")


def _allowed(user_id: int | None, topic: str, publishing: bool) -> bool:
    if user_id is None or not topic.startswith(NOTIFICATIONS_PREFIX):
        return True
    return not publishing and topic == f"{NOTIFICATIONS_PREFIX}{user_id}"


@router.websocket("", name="socket")
async def socket(ws: WebSocket, token: str | None = None) -> None:
    user_id = decode_token(token) if token else None
    if _auth_on() and user_id is None:
        await ws.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not authenticated")
        return
    await ws.accept()
    hub.bind()
    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = client_message.validate_json(raw)
            except ValidationError as e:
                await ws.send_json({"topic": "error", "data": {"detail": e.errors(include_url=False, include_context=False)}})
                continue
            if not _allowed(user_id, msg.topic, isinstance(msg, Publish)):
                await ws.send_json({"topic": "error", "data": {"detail": f"forbidden topic {msg.topic}"}})
            elif isinstance(msg, Subscribe):
                await hub.subscribe(ws, msg.topic)
            elif isinstance(msg, Publish):
                await hub.broadcast(msg.topic, msg.data)
            else:
                await hub.unsubscribe(ws, msg.topic)
    except WebSocketDisconnect:
        pass
    finally:
        await hub.disconnect(ws)


@router.post("/publish", name="publish_event", status_code=status.HTTP_202_ACCEPTED)
def publish_event(body: PublishRequest, user: OptionalUser) -> ServerMessage:
    """Publish from outside the process (e.g. `make simulate`). Sync, like any router."""
    if _auth_on() and user is None:
        raise HTTPException(401, "Not authenticated", headers={"WWW-Authenticate": "Bearer"})
    if not _allowed(user.id if user else None, body.topic, publishing=True):
        raise HTTPException(403, "Use notify() server-side for notifications")
    publish(body.topic, body.data)
    return ServerMessage(topic=body.topic, data=body.data)
