"""LLM errors. `backend.api.core.app` maps LLMError to HTTP 503 {detail}."""


class LLMError(Exception):
    """Raised with a friendly, actionable message (e.g. "set `GROQ_API_KEY` in .env")."""


def missing_key(var: str) -> LLMError:
    return LLMError(f"set `{var}` in .env")


def fail(label: str, exc: Exception) -> LLMError:
    """Wrap any provider exception as an LLMError (LLMErrors pass through)."""
    if isinstance(exc, LLMError):
        return exc
    return LLMError(f"{label} call failed: {type(exc).__name__}: {exc}")
