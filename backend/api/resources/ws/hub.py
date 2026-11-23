"""In-process topic pub/sub (one worker, no Redis).

All subscription state lives on the event loop thread. `publish()` is sync and
thread-safe: sync routers run in a threadpool, so it hands the send off to the
loop with `call_soon_threadsafe`.
"""
import asyncio
from collections import defaultdict
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder

from backend.api.resources.ws.models import (
    NOTIFICATIONS_PREFIX,
    PRESENCE_PREFIX,
    Notification,
    Presence,
    ServerMessage,
)


class Hub:
    def __init__(self) -> None:
        self._topics: dict[str, set[WebSocket]] = defaultdict(set)
        self._loop: asyncio.AbstractEventLoop | None = None
        self._tasks: set[asyncio.Task] = set()  # strong refs until each send finishes

    def bind(self) -> None:
        """Remember the running loop; called by each new connection."""
        self._loop = asyncio.get_running_loop()

    # --- loop-thread API (async, used by the router) ---

    async def subscribe(self, ws: WebSocket, topic: str) -> None:
        if ws in self._topics[topic]:
            return
        self._topics[topic].add(ws)
        await self._presence_changed(topic)

    async def unsubscribe(self, ws: WebSocket, topic: str) -> None:
        subs = self._topics.get(topic)
        if not subs or ws not in subs:
            return
        subs.discard(ws)
        if not subs:
            del self._topics[topic]
        await self._presence_changed(topic)

    async def disconnect(self, ws: WebSocket) -> None:
        for topic in [t for t, subs in self._topics.items() if ws in subs]:
            await self.unsubscribe(ws, topic)

    async def broadcast(self, topic: str, data: Any) -> None:
        message = jsonable_encoder(ServerMessage(topic=topic, data=jsonable_encoder(data)))
        dead: list[WebSocket] = []
        for ws in list(self._topics.get(topic, ())):
            try:
                await ws.send_json(message)
            except (WebSocketDisconnect, RuntimeError, OSError):  # client went away mid-send
                dead.append(ws)
        for ws in dead:
            await self.disconnect(ws)

    def count(self, topic: str) -> int:
        return len(self._topics.get(topic, ()))

    async def _presence_changed(self, topic: str) -> None:
        if topic.startswith(PRESENCE_PREFIX):
            await self.broadcast(topic, Presence(count=self.count(topic)))

    # --- any-thread API (sync) ---

    def publish(self, topic: str, data: Any = None) -> None:
        """Send `{topic, data}` to every subscriber. Safe from sync code and any thread."""
        loop = self._loop
        if loop is None or loop.is_closed():
            return  # no client ever connected: nobody to tell
        loop.call_soon_threadsafe(self._spawn, topic, data)

    def _spawn(self, topic: str, data: Any) -> None:
        task = asyncio.create_task(self.broadcast(topic, data))
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)


hub = Hub()


def publish(topic: str, data: Any = None) -> None:
    """Publish `data` (JSON-able or a Pydantic model) on `topic`. Sync, thread-safe."""
    hub.publish(topic, data)


def notify(user_id: int, title: str, body: str) -> None:
    """In-app notification for one user, on topic `notifications:<user_id>`."""
    publish(f"{NOTIFICATIONS_PREFIX}{user_id}", Notification(title=title, body=body))
