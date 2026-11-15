"""Speech-to-text (STT_PROVIDER) and swappable TTS (TTS_PROVIDER)."""

from __future__ import annotations


def transcribe(audio: bytes, *, mime: str, language: str | None = None) -> str:
    raise NotImplementedError  # TODO(#58)
