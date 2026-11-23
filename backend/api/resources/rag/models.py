from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(min_length=1)


class Citation(BaseModel):
    document_id: int | None
    title: str
    snippet: str


class AskResponse(BaseModel):
    answer: str
    citations: list[Citation]
