"""Claude via the anthropic SDK. SDK imported lazily so the package imports without keys."""

from __future__ import annotations

import time
from collections.abc import Iterator
from typing import TYPE_CHECKING, Any

from backend.llm.errors import LLMError
from backend.llm.providers.openai_compat import (
    MAX_RETRIES,
    TIMEOUT_S,
    log_call,
    strict_schema,
)

if TYPE_CHECKING:
    from pydantic import BaseModel

MAX_TOKENS = 4096


class AnthropicProvider:
    name = "claude"

    def __init__(self, api_key: str, default_model: str, embedder: Any = None) -> None:
        self.api_key = api_key
        self.default_model = default_model
        self.embedder = embedder  # provider used for embed(): Claude has no embeddings
        self._client: Any = None

    @property
    def client(self) -> Any:
        if self._client is None:
            from anthropic import Anthropic

            self._client = Anthropic(
                api_key=self.api_key, timeout=TIMEOUT_S, max_retries=MAX_RETRIES
            )
        return self._client

    def _args(self, messages: list[dict], model: str | None, system: str | None) -> dict:
        args: dict[str, Any] = {
            "model": model or self.default_model,
            "max_tokens": MAX_TOKENS,
            "messages": messages,
        }
        if system:
            args["system"] = system
        return args

    @staticmethod
    def _text(r: Any) -> str:
        return "".join(b.text for b in r.content if getattr(b, "type", "") == "text")

    def _fail(self, exc: Exception) -> LLMError:
        if isinstance(exc, LLMError):
            return exc
        return LLMError(f"claude call failed: {type(exc).__name__}: {exc}")

    def complete(
        self, messages: list[dict], *, model: str | None = None, system: str | None = None
    ) -> str:
        args, t0 = self._args(messages, model, system), time.monotonic()
        try:
            r = self.client.messages.create(**args)
        except Exception as exc:
            raise self._fail(exc) from exc
        log_call("claude", args["model"], r.usage.input_tokens, r.usage.output_tokens, t0)
        return self._text(r)

    def complete_json(
        self,
        messages: list[dict],
        schema: type[BaseModel],
        *,
        model: str | None = None,
        system: str | None = None,
    ) -> BaseModel:
        args, t0 = self._args(messages, model, system), time.monotonic()
        args["output_config"] = {
            "format": {"type": "json_schema", "schema": strict_schema(schema.model_json_schema())}
        }
        try:
            r = self.client.messages.create(**args)
            log_call("claude", args["model"], r.usage.input_tokens, r.usage.output_tokens, t0)
            return schema.model_validate_json(self._text(r))
        except Exception as exc:
            raise self._fail(exc) from exc

    def stream(
        self, messages: list[dict], *, model: str | None = None, system: str | None = None
    ) -> Iterator[str]:
        args, t0 = self._args(messages, model, system), time.monotonic()
        try:
            with self.client.messages.stream(**args) as s:
                yield from s.text_stream
                u = s.get_final_message().usage
        except Exception as exc:
            raise self._fail(exc) from exc
        log_call("claude", args["model"], u.input_tokens, u.output_tokens, t0)

    def embed(self, texts: list[str]) -> list[list[float]]:
        if self.embedder is None:
            raise LLMError("Claude has no embeddings; set EMBED_PROVIDER to gemini or ollama")
        return self.embedder.embed(texts)
