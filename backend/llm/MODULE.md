---
module: llm
lane: llm
requires: [api]
profile: null
extra: llm
env:
  - LLM_PROVIDER
  - LLM_MODEL_FAST
  - LLM_MODEL_SMART
  - LLM_CACHE
  - GROQ_API_KEY
  - ANTHROPIC_API_KEY
  - OPENROUTER_API_KEY
  - EMBED_PROVIDER
  - GEMINI_API_KEY
  - STT_PROVIDER
  - TTS_PROVIDER
  - ELEVENLABS_API_KEY
paths:
  - backend/llm
  - backend/api/resources/chat
  - backend/api/resources/rag
  - backend/api/resources/transcribe
profiles_noted:
  - ollama (local embeddings when EMBED_PROVIDER=ollama)
  - speech (local speech service)
keep_when:
  - the product calls a language model, embeddings or speech
features:
  - id: chat
    gives: streaming chat over WebSocket
    entry: backend/api/resources/chat (/api/llm/chat/ws)
    keep_when: a Beat is a conversation with the model
  - id: rag
    gives: pgvector search and answers over ingested documents
    entry: backend/api/resources/rag (/api/rag/ask)
    keep_when: answers must come from the team's own documents
  - id: voice
    gives: speech-to-text and swappable TTS
    entry: backend/api/resources/transcribe (/api/llm/transcribe)
    keep_when: a Beat uses spoken input or output
---
