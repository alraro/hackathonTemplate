"""LLM settings read from the environment lazily; nothing here raises at import."""

from __future__ import annotations

import os
from typing import Literal

from backend.llm.errors import LLMError, missing_key

Tier = Literal["fast", "smart"]

# Tier preset table: provider -> tier -> model. Override with LLM_MODEL_FAST / LLM_MODEL_SMART.
# OpenRouter ids are equivalent `:free` models; keep them documented here.
PRESETS: dict[str, dict[str, str]] = {
    "groq": {"fast": "openai/gpt-oss-20b", "smart": "openai/gpt-oss-120b"},
    "claude": {"fast": "claude-haiku-5-5", "smart": "claude-sonnet-5-5"},
    "openrouter": {
        "fast": "openai/gpt-oss-20b:free",
        "smart": "openai/gpt-oss-120b:free",
    },
}

KEY_VARS = {
    "groq": "GROQ_API_KEY",
    "claude": "ANTHROPIC_API_KEY",
    "openrouter": "OPENROUTER_API_KEY",
}

BASE_URLS = {
    "groq": "https://api.groq.com/openai/v1",
    "openrouter": "https://openrouter.ai/api/v1",
}

EMBED_PROVIDERS = ("gemini", "ollama")


def provider() -> str:
    value = os.environ.get("LLM_PROVIDER", "groq").strip().lower() or "groq"
    if value not in PRESETS:
        raise LLMError(f"LLM_PROVIDER must be one of {', '.join(PRESETS)}, got {value!r}")
    return value


def model_for(tier: Tier = "fast") -> str:
    override = os.environ.get(f"LLM_MODEL_{tier.upper()}")
    return override or PRESETS[provider()][tier]


def api_key() -> str:
    var = KEY_VARS[provider()]
    key = os.environ.get(var)
    if not key:
        raise missing_key(var)
    return key


def embed_provider() -> str:
    value = os.environ.get("EMBED_PROVIDER", "gemini").strip().lower() or "gemini"
    if value not in EMBED_PROVIDERS:
        raise LLMError(f"EMBED_PROVIDER must be gemini or ollama, got {value!r}")
    return value


def cache_enabled() -> bool:
    return os.environ.get("LLM_CACHE", "on").strip().lower() != "off"


def output_language() -> str | None:
    return os.environ.get("OUTPUT_LANGUAGE") or None


EMBED_MODELS = {"gemini": "gemini-embedding-001", "ollama": "nomic-embed-text"}
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"


def embed_backend():
    """Provider used for embeddings: Gemini (default) or local Ollama."""
    from backend.llm.providers.openai_compat import OpenAICompatProvider, ollama_url

    name = embed_provider()
    if name == "gemini":
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            raise missing_key("GEMINI_API_KEY")
        return OpenAICompatProvider(name, GEMINI_BASE_URL, key, embed_model=EMBED_MODELS[name])
    return OpenAICompatProvider(name, ollama_url(), "ollama", embed_model=EMBED_MODELS[name])


class _LazyEmbedder:
    """Defers the embed-provider key check until embed() is actually called."""

    def embed(self, texts: list[str]) -> list[list[float]]:
        return embed_backend().embed(texts)


def get_provider():
    """Build the configured provider; raises LLMError with a friendly message if no key."""
    from backend.llm.providers.anthropic import AnthropicProvider
    from backend.llm.providers.openai_compat import OpenAICompatProvider

    name = provider()
    key = api_key()
    default = model_for("fast")
    if name == "claude":
        return AnthropicProvider(key, default, embedder=_LazyEmbedder())
    return OpenAICompatProvider(name, BASE_URLS[name], key, default_model=default)
