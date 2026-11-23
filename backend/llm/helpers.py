"""Sync LLM helpers. All but `embed` take an optional `model=` (a tier name or model id)."""

from __future__ import annotations

import re
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
        return settings.get_provider().complete_json(msgs, Result, model=m).label

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

    out = cache.cached_call(_key("summarize", m, {"prompt": prompt}), call)
    return _limit_words(out, max_words)


def _limit_words(text: str, max_words: int) -> str:
    """Cut `text` to `max_words` words: at the last sentence end if it keeps half the limit, else hard."""
    words = text.split()
    if max_words < 1 or len(words) <= max_words:
        return text
    head = " ".join(words[:max_words])
    ends = [m.end() for m in re.finditer(r"[.!?](?=\s|$)", head)]
    # Cut at a sentence end only if that keeps at least half of the allowed words.
    if ends and len(head[: ends[-1]].split()) * 2 >= max_words:
        return head[: ends[-1]]
    return head + "…"


class ChatStream:
    """Iterator of answer text chunks; `.citations` lists the chunks the answer is grounded on."""

    def __init__(self, stream: Iterator[str], citations: list) -> None:
        self._stream = stream
        self.citations = citations

    def __iter__(self) -> ChatStream:
        return self

    def __next__(self) -> str:
        return next(self._stream)

    def close(self) -> None:
        close = getattr(self._stream, "close", None)
        if close:
            close()


def chat(
    messages: list[dict],
    *,
    system: str | None = None,
    use_rag: bool = False,
    model: str | None = None,
) -> ChatStream:
    """Stream a chat answer on the smart tier; `use_rag` grounds it in ingested documents.

    The result iterates text chunks; `.citations` holds the chunks used (empty without RAG).
    """
    m = _model(model, "smart")
    extra = system or ""
    found: list = []
    if use_rag:
        from backend.llm import rag

        query = next((x["content"] for x in reversed(messages) if x.get("role") == "user"), "")
        found = rag.search(query)
        context = "\n\n".join(f"[{c.title or c.source}] {c.text}" for c in found)
        if context:
            extra += f"\nAnswer using this context and cite sources in brackets:\n{context}"
    sys_prompt = render("chat_system", extra=extra)
    key = _key("chat", m, {"system": sys_prompt, "messages": messages})

    def gen() -> Iterator[str]:
        return settings.get_provider().stream(messages, model=m, system=sys_prompt)

    return ChatStream(cache.cached_stream(key, gen), found)


def embed(texts: list[str]) -> list[list[float]]:
    """Embed texts with the configured EMBED_PROVIDER (768 dimensions), cached per text."""
    if not texts:
        return []
    name, model = settings.embed_provider(), settings.EMBED_MODELS[settings.embed_provider()]
    keys = [cache.key_for(name, model, {"op": "embed", "text": t}) for t in texts]
    found = [cache.get(k) for k in keys]
    missing = [i for i, v in enumerate(found) if v is None]
    if missing:
        fresh = settings.embed_backend().embed([texts[i] for i in missing])
        for i, vec in zip(missing, fresh, strict=True):
            found[i] = vec
            cache.put(keys[i], vec)
    return found  # type: ignore[return-value]
