from pydantic import BaseModel, Field


class TranscribeResponse(BaseModel):
    text: str


class SpeakRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
