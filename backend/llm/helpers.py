"""Sync LLM helpers. All take an optional `model=` (a tier name or model id)."""

from __future__ import annotations

from collections.abc import Iterator
from typing import Literal

from pydantic import BaseModel, create_model

from backend.llm import cache, settings
from backend.llm.render import render


def _model(model: str | None, tier: settings.Tier) -> str:
    """A tier name, an explicit model id, or the tier default."""
    if model in ("fast", "smart"):
        return settings.model_for(model)  # type: ignore[arg-type]
    return model or settings.model_for(tier)


def _key(op: str, model: str, payload: dict) -> str:
    return cache.key_for(settings.provider(), model, {"op": op, **payload})


def classify(
    text: str, labels: list[str], *, instructions: str | None = None, model: str | None = None
) -> str:
    """Return exactly one of `labels` (structured output with an enum)."""
    m = _model(model, "fast")
    prompt = render(
        "classify", text=text, labels=", ".join(labels), instructions=instructions or ""
    )
    Result = create_model("Classification", label=(Literal[tuple(labels)], ...))  # type: ignore[valid-type]
    msgs = [{"role": "user", "content": prompt}]

    def call() -> str:
        return settings.get_provider().complete_json(msgs, Result, model=m).label  # type: ignore[attr-defined]

    return cache.cached_call(_key("classify", m, {"prompt": prompt, "labels": labels}), call)


def extract(
    text: str,
    schema: type[BaseModel],
    *,
    instructions: str | None = None,
    model: str | None = None,
) -> BaseModel:
    """Strict JSON extraction into `schema` (non-streaming)."""
    m = _model(model, "fast")
    prompt = render("extract", text=text, instructions=instructions or "")
    msgs = [{"role": "user", "content": prompt}]

    def call() -> dict:
        return settings.get_provider().complete_json(msgs, schema, model=m).model_dump(mode="json")

    key = _key("extract", m, {"prompt": prompt, "schema": schema.model_json_schema()})
    return schema.model_validate(cache.cached_call(key, call))


def summarize(
    text: str, *, max_words: int = 80, style: str | None = None, model: str | None = None
) -> str:
    """Summary of at most `max_words` words in the given `style`."""
    m = _model(model, "fast")
    prompt = render("summarize", text=text, max_words=max_words, style=style or "neutral")
    msgs = [{"role": "user", "content": prompt}]

    def call() -> str:
        return settings.get_provider().complete(msgs, model=m)

    return cache.cached_call(_key("summarize", m, {"prompt": prompt}), call)


def chat(
    messages: list[dict],
    *,
    system: str | None = None,
    use_rag: bool = False,
    model: str | None = None,
) -> Iterator[str]:
    """Stream a chat answer on the smart tier; `use_rag` grounds it in ingested documents."""
    m = _model(model, "smart")
    extra = system or ""
    if use_rag:
        from backend.llm import rag

        query = next((x["content"] for x in reversed(messages) if x.get("role") == "user"), "")
        context = "\n\n".join(f"[{c.source}] {c.text}" for c in rag.search(query))
        if context:
            extra += f"\nAnswer using this context and cite sources in brackets:\n{context}"
    sys_prompt = render("chat_system", extra=extra)
    key = _key("chat", m, {"system": sys_prompt, "messages": messages})

    def gen() -> Iterator[str]:
        return settings.get_provider().stream(messages, model=m, system=sys_prompt)

    return cache.cached_stream(key, gen)


def embed(texts: list[str], *, model: str | None = None) -> list[list[float]]:
    """Embed texts with the configured EMBED_PROVIDER (768 dimensions)."""
    return settings.embed_backend().embed(texts)
