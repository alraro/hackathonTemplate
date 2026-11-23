"""Chat socket frames: one Pydantic model per frame kind, discriminated by `type`.

Client -> server: `ChatRequest` `{messages, use_rag?}` starts an answer; `Stop` `{type: stop}`
cancels the one streaming. Server -> client: `delta`* then `done` or `error`.
"""
from typing import Annotated, Literal

from pydantic import BaseModel, Field, TypeAdapter


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)
    use_rag: bool = False


class Stop(BaseModel):
    type: Literal["stop"]


ClientFrame = Stop | ChatRequest  # ChatRequest carries no `type`, as in the Contract
client_frame = TypeAdapter(ClientFrame)


class Citation(BaseModel):
    source: str
    title: str | None = None
    text: str
    score: float = 0.0


class Delta(BaseModel):
    type: Literal["delta"] = "delta"
    text: str


class Done(BaseModel):
    type: Literal["done"] = "done"
    citations: list[Citation] = []


class ChatError(BaseModel):
    type: Literal["error"] = "error"
    detail: str


ServerFrame = Annotated[Delta | Done | ChatError, Field(discriminator="type")]


class ChatFrames(BaseModel):
    """Not a payload: exports the socket frames to openapi.json for typed clients."""

    client: ClientFrame
    server: ServerFrame
