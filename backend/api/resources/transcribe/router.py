from fastapi import APIRouter, HTTPException, Response, UploadFile
from fastapi.concurrency import run_in_threadpool

from backend.api.resources.transcribe.models import SpeakRequest, TranscribeResponse

router = APIRouter(prefix="/api/llm", tags=["transcribe"])

MAX_BYTES = 25 * 1024 * 1024


@router.post("/transcribe")
async def transcribe(file: UploadFile, language: str | None = None) -> TranscribeResponse:
    """Speech-to-text for one audio clip (multipart field `file`)."""
    from backend.llm import voice  # module:llm

    audio = await file.read(MAX_BYTES + 1)
    if len(audio) > MAX_BYTES:
        raise HTTPException(413, "Audio exceeds the 25 MB limit")
    mime = file.content_type or "audio/wav"
    text = await run_in_threadpool(voice.transcribe, audio, mime=mime, language=language)
    return TranscribeResponse(text=text)


@router.post("/speak", responses={200: {"content": {"audio/mpeg": {}}}, 204: {}})
async def speak(body: SpeakRequest) -> Response:
    """Server TTS audio. 204 when TTS_PROVIDER=browser (the web speaks with speechSynthesis)."""
    from backend.llm import voice  # module:llm

    audio = await run_in_threadpool(voice.speak, body.text)
    if not audio:
        return Response(status_code=204)
    return Response(audio, media_type=voice.speak_mime())
