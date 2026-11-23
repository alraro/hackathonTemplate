"""Realtime messages: one Pydantic model per message kind (the Event Seam).

Client -> server: `{op: subscribe|unsubscribe|publish, topic, data}`.
Server -> client: `{topic, data}`.
"""
from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field, TypeAdapter

PRESENCE_PREFIX = "presence:"
NOTIFICATIONS_PREFIX = "notifications:"


class Subscribe(BaseModel):
    op: Literal["subscribe"]
    topic: str


class Unsubscribe(BaseModel):
    op: Literal["unsubscribe"]
    topic: str


class Publish(BaseModel):
    op: Literal["publish"]
    topic: str
    data: Any = None


ClientMessage = Annotated[Subscribe | Unsubscribe | Publish, Field(discriminator="op")]
client_message = TypeAdapter(ClientMessage)


class ServerMessage(BaseModel):
    topic: str
    data: Any = None


class Presence(BaseModel):
    """`data` of a `presence:<key>` message: clients subscribed to that topic."""

    count: int


class Notification(BaseModel):
    """`data` of a `notifications:<user_id>` message."""

    title: str
    body: str


class PublishRequest(BaseModel):
    """Body of `POST /api/ws/publish`, for scripts and other processes."""

    topic: str
    data: Any = None
