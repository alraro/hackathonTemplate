"""Realtime public API: `from backend.api.realtime import publish, notify`.

- `publish(topic, data)`: sync, thread-safe; every `/api/ws` subscriber of `topic` gets `{topic, data}`.
- `notify(user_id, title, body)`: in-app notification on `notifications:<user_id>`.
- Presence: clients subscribed to `presence:<key>` receive `{count}` on every join/leave.
"""
from backend.api.resources.ws.hub import notify, publish

__all__ = ["notify", "publish"]
