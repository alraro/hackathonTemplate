"""Speech-to-text (STT_PROVIDER) and swappable TTS (TTS_PROVIDER).

STT_PROVIDER=groq|speaches|elevenlabs (default groq, Whisper large-v3-turbo).
TTS_PROVIDER=browser|speaches|elevenlabs (default browser: the web app speaks with
`speechSynthesis`, so the backend returns nothing). Env is read lazily on every call.
"""

from __future__ import annotations

import mimetypes
import os
import time
from typing import Any

from backend.llm.errors import LLMError, missing_key
from backend.llm.providers.openai_compat import TIMEOUT_S, log_call
from backend.llm.settings import BASE_URLS

STT_PROVIDERS = ("groq", "speaches", "elevenlabs")
TTS_PROVIDERS = ("browser", "speaches", "elevenlabs")

GROQ_STT_MODEL = "whisper-large-v3-turbo"
SPEACHES_STT_MODEL = "Systran/faster-whisper-small"
SPEACHES_TTS_MODEL = "speaches-ai/Kokoro-82M-v1.0-ONNX"
SPEACHES_TTS_VOICE = "af_heart"
ELEVENLABS_URL = "https://api.elevenlabs.io/v1"
ELEVENLABS_STT_MODEL = "scribe_v1"
ELEVENLABS_TTS_MODEL = "eleven_multilingual_v2"
ELEVENLABS_VOICE = "21m00Tcm4TlvDq8ikWAM"
ELEVENLABS_TTS_FORMAT = "mp3_44100_128"


def _choice(var: str, default: str, allowed: tuple[str, ...]) -> str:
    value = os.environ.get(var, default).strip().lower() or default
    if value not in allowed:
        raise LLMError(f"{var} must be one of {', '.join(allowed)}, got {value!r}")
    return value


def stt_provider() -> str:
    return _choice("STT_PROVIDER", "groq", STT_PROVIDERS)


def tts_provider() -> str:
    return _choice("TTS_PROVIDER", "browser", TTS_PROVIDERS)


def speaches_url() -> str:
    return os.environ.get("SPEACHES_URL", "http://speech:8000").rstrip("/") + "/v1"


def _key(var: str) -> str:
    key = os.environ.get(var)
    if not key:
        raise missing_key(var)
    return key


def _compat(name: str):
    """OpenAI-compatible client for Groq or Speaches (same adapter, different base URL)."""
    from backend.llm.providers.openai_compat import OpenAICompatProvider

    if name == "groq":
        return OpenAICompatProvider(name, BASE_URLS["groq"], _key("GROQ_API_KEY"))
    return OpenAICompatProvider(name, speaches_url(), "speaches")


def _filename(mime: str) -> str:
    ext = mimetypes.guess_extension(mime.split(";")[0].strip()) or ".wav"
    return "audio" + {".oga": ".ogg", ".weba": ".webm"}.get(ext, ext)


def _fail(provider: str, exc: Exception) -> LLMError:
    if isinstance(exc, LLMError):
        return exc
    return LLMError(f"{provider} voice call failed: {type(exc).__name__}: {exc}")


def transcribe(audio: bytes, *, mime: str, language: str | None = None) -> str:
    name, t0 = stt_provider(), time.monotonic()
    model = {
        "groq": GROQ_STT_MODEL,
        "speaches": SPEACHES_STT_MODEL,
        "elevenlabs": ELEVENLABS_STT_MODEL,
    }[name]
    try:
        if name == "elevenlabs":
            text = _elevenlabs_stt(audio, mime, language)
        else:
            kwargs: dict[str, Any] = {"language": language} if language else {}
            r = _compat(name).client.audio.transcriptions.create(
                model=model, file=(_filename(mime), audio, mime), **kwargs
            )
            text = r.text
    except Exception as exc:
        raise _fail(name, exc) from exc
    log_call(name, model, None, None, t0)
    return text.strip()


def _elevenlabs_stt(audio: bytes, mime: str, language: str | None) -> str:
    import httpx

    data = {"model_id": ELEVENLABS_STT_MODEL}
    if language:
        data["language_code"] = language
    r = httpx.post(
        f"{ELEVENLABS_URL}/speech-to-text",
        headers={"xi-api-key": _key("ELEVENLABS_API_KEY")},
        data=data,
        files={"file": (_filename(mime), audio, mime)},
        timeout=TIMEOUT_S,
    )
    r.raise_for_status()
    return r.json()["text"]


def speak_mime() -> str:
    """Content type of the bytes `speak()` returns."""
    return "audio/mpeg"


def speak(text: str) -> bytes:
    """Synthesize `text` with a server TTS. TTS_PROVIDER=browser returns b"" (the web speaks)."""
    name, t0 = tts_provider(), time.monotonic()
    if name == "browser":
        return b""
    try:
        if name == "elevenlabs":
            import httpx

            voice = os.environ.get("ELEVENLABS_VOICE_ID", ELEVENLABS_VOICE)
            r = httpx.post(
                f"{ELEVENLABS_URL}/text-to-speech/{voice}",
                params={"output_format": ELEVENLABS_TTS_FORMAT},
                headers={"xi-api-key": _key("ELEVENLABS_API_KEY")},
                json={"text": text, "model_id": ELEVENLABS_TTS_MODEL},
                timeout=TIMEOUT_S,
            )
            r.raise_for_status()
            audio = r.content
            model = ELEVENLABS_TTS_MODEL
        else:
            model = SPEACHES_TTS_MODEL
            resp = _compat("speaches").client.audio.speech.create(
                model=model, voice=SPEACHES_TTS_VOICE, input=text, response_format="mp3"
            )
            audio = resp.content
    except Exception as exc:
        raise _fail(name, exc) from exc
    log_call(name, model, None, None, t0)
    return audio
