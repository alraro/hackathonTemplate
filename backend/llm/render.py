"""Prompt template rendering from `prompts/`."""

from __future__ import annotations

from pathlib import Path

from backend.llm.settings import output_language

PROMPTS_DIR = Path(__file__).parent / "prompts"


def render(name: str, **variables: object) -> str:
    """Render `prompts/<name>.md` with `{var}` placeholders via str.format.

    `output_language` defaults to OUTPUT_LANGUAGE (or "the language of the input").
    """
    path = PROMPTS_DIR / f"{name}.md"
    if not path.is_file():
        raise FileNotFoundError(f"No prompt named {name!r} (expected {path})")
    variables.setdefault("output_language", output_language() or "the language of the input")
    return path.read_text(encoding="utf-8").strip().format(**variables)
