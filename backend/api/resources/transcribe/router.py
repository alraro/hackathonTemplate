from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile

from backend.api.resources.auth.deps import login_if_auth_on
from backend.api.resources.transcribe.models import SpeakRequest, TranscribeResponse

router = APIRouter(prefix="/api/llm", tags=["transcribe"])

MAX_BYTES = 25 * 1024 * 1024


@router.post("/transcribe", name="transcribe")
def transcribe(file: UploadFile, language: str | None = None, _user=Depends(login_if_auth_on)) -> TranscribeResponse:
    """Speech-to-text for one audio clip (multipart field `file`)."""
    from backend.llm import voice  # module:llm

    audio = file.file.read(MAX_BYTES + 1)
    if len(audio) > MAX_BYTES:
        raise HTTPException(413, "Audio exceeds the 25 MB limit")
    mime = file.content_type or "audio/wav"
    text = voice.transcribe(audio, mime=mime, language=language)
    return TranscribeResponse(text=text)


@router.post("/speak", name="speak", responses={200: {"content": {"audio/mpeg": {}}}, 204: {}})
def speak(body: SpeakRequest, _user=Depends(login_if_auth_on)) -> Response:
    """Server TTS audio. 204 when TTS_PROVIDER=browser (the web speaks with speechSynthesis)."""
    from backend.llm import voice  # module:llm

    audio = voice.speak(body.text)
    if not audio:
        return Response(status_code=204)
    return Response(audio, media_type=voice.speak_mime())
