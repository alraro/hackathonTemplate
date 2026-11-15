"""LLM errors. `backend.api.core.app` maps LLMError to HTTP 503 {detail}."""


class LLMError(Exception):
    """Raised with a friendly, actionable message (e.g. "set `GROQ_API_KEY` in .env")."""


def missing_key(var: str) -> LLMError:
    return LLMError(f"set `{var}` in .env")
