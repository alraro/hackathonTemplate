from fastapi import APIRouter

from backend.api.resources.rag.models import AskRequest, AskResponse, Citation
from backend.llm import rag

router = APIRouter(prefix="/api/rag", tags=["rag"])


@router.post("/ask", name="ask")
def ask(body: AskRequest) -> AskResponse:
    """Answer a question from the ingested documents, with citations."""
    result = rag.answer(body.question)
    return AskResponse(
        answer=result.answer,
        citations=[
            Citation(
                document_id=c.document_id,
                title=c.title or c.source,
                snippet=rag.snippet(c.text),
            )
            for c in result.citations
        ],
    )
