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
