"""Groq/OpenRouter/Gemini/Ollama via the openai SDK base_url. SDK imported lazily."""

from __future__ import annotations

import logging
import os
import time
from collections.abc import Iterator
from typing import TYPE_CHECKING, Any

from backend.llm.errors import LLMError

if TYPE_CHECKING:
    from pydantic import BaseModel

log = logging.getLogger("backend.llm")

TIMEOUT_S = 30.0
MAX_RETRIES = 3  # the SDK backs off on 429/5xx and honours retry-after
EMBED_DIMENSIONS = 768
GEMINI_NATIVE = "https://generativelanguage.googleapis.com/v1beta/models"


def strict_schema(node: Any) -> Any:
    """Make a pydantic JSON schema acceptable to strict structured output."""
    if isinstance(node, dict):
        out = {k: strict_schema(v) for k, v in node.items()}
        if out.get("type") == "object" or "properties" in out:
            out["additionalProperties"] = False
            out["required"] = list(out.get("properties", {}))
        return out
    if isinstance(node, list):
        return [strict_schema(v) for v in node]
    return node


def with_system(messages: list[dict], system: str | None) -> list[dict]:
    return [{"role": "system", "content": system}, *messages] if system else list(messages)


def log_call(provider: str, model: str, tin: int | None, tout: int | None, t0: float) -> None:
    log.info(
        "llm provider=%s model=%s tokens_in=%s tokens_out=%s latency_ms=%d",
        provider,
        model,
        tin,
        tout,
        (time.monotonic() - t0) * 1000,
    )


class OpenAICompatProvider:
    def __init__(
        self,
        name: str,
        base_url: str | None,
        api_key: str,
        default_model: str | None = None,
        embed_model: str | None = None,
    ) -> None:
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.default_model = default_model
        self.embed_model = embed_model
        self._client: Any = None

    @property
    def client(self) -> Any:
        if self._client is None:
            from openai import OpenAI

            self._client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
                timeout=TIMEOUT_S,
                max_retries=MAX_RETRIES,
            )
        return self._client

    def _model(self, model: str | None) -> str:
        chosen = model or self.default_model
        if not chosen:
            raise LLMError(f"no model configured for provider {self.name}")
        return chosen

    def _fail(self, exc: Exception) -> LLMError:
        if isinstance(exc, LLMError):
            return exc
        return LLMError(f"{self.name} call failed: {type(exc).__name__}: {exc}")

    def complete(
        self, messages: list[dict], *, model: str | None = None, system: str | None = None
    ) -> str:
        m, t0 = self._model(model), time.monotonic()
        try:
            r = self.client.chat.completions.create(model=m, messages=with_system(messages, system))
        except Exception as exc:
            raise self._fail(exc) from exc
        u = r.usage
        log_call(self.name, m, u and u.prompt_tokens, u and u.completion_tokens, t0)
        return r.choices[0].message.content or ""

    def complete_json(
        self,
        messages: list[dict],
        schema: type[BaseModel],
        *,
        model: str | None = None,
        system: str | None = None,
    ) -> BaseModel:
        m, t0 = self._model(model), time.monotonic()
        fmt = {
            "type": "json_schema",
            "json_schema": {
                "name": schema.__name__,
                "schema": strict_schema(schema.model_json_schema()),
                "strict": True,
            },
        }
        try:
            r = self.client.chat.completions.create(
                model=m, messages=with_system(messages, system), response_format=fmt
            )
            u = r.usage
            log_call(self.name, m, u and u.prompt_tokens, u and u.completion_tokens, t0)
            return schema.model_validate_json(r.choices[0].message.content or "")
        except Exception as exc:
            raise self._fail(exc) from exc

    def stream(
        self, messages: list[dict], *, model: str | None = None, system: str | None = None
    ) -> Iterator[str]:
        m, t0 = self._model(model), time.monotonic()
        usage: Any = None
        try:
            events = self.client.chat.completions.create(
                model=m,
                messages=with_system(messages, system),
                stream=True,
                stream_options={"include_usage": True},
            )
            for ev in events:
                usage = getattr(ev, "usage", None) or usage
                if ev.choices and ev.choices[0].delta.content:
                    yield ev.choices[0].delta.content
        except Exception as exc:
            raise self._fail(exc) from exc
        log_call(
            self.name, m, usage and usage.prompt_tokens, usage and usage.completion_tokens, t0
        )

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not self.embed_model:
            raise LLMError(f"{self.name} has no embedding model configured")
        t0 = time.monotonic()
        try:
            kwargs: dict[str, Any] = {}
            if self.name == "gemini":
                kwargs["dimensions"] = EMBED_DIMENSIONS
            r = self.client.embeddings.create(model=self.embed_model, input=texts, **kwargs)
            vectors = [d.embedding for d in r.data]
            if self.name == "gemini" and any(len(v) != EMBED_DIMENSIONS for v in vectors):
                vectors = self._gemini_native(texts)
        except Exception as exc:
            raise self._fail(exc) from exc
        log_call(self.name, self.embed_model, None, None, t0)
        return vectors

    def _gemini_native(self, texts: list[str]) -> list[list[float]]:
        """Fallback when the OpenAI-compat endpoint ignores `dimensions`."""
        import httpx

        model = self.embed_model
        body = {
            "requests": [
                {
                    "model": f"models/{model}",
                    "content": {"parts": [{"text": t}]},
                    "outputDimensionality": EMBED_DIMENSIONS,
                }
                for t in texts
            ]
        }
        r = httpx.post(
            f"{GEMINI_NATIVE}/{model}:batchEmbedContents",
            headers={"x-goog-api-key": self.api_key},
            json=body,
            timeout=TIMEOUT_S,
        )
        r.raise_for_status()
        return [e["values"] for e in r.json()["embeddings"]]


def ollama_url() -> str:
    return os.environ.get("OLLAMA_URL", "http://localhost:11434").rstrip("/") + "/v1"
