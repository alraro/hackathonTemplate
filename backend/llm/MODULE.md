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
  - ELEVENLABS_VOICE_ID
  - OLLAMA_URL
  - SPEACHES_URL
  - OUTPUT_LANGUAGE
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

# LLM Module

Calls to a language model, embeddings and speech, behind sync helpers in `backend/llm/helpers.py`. A resource imports a helper; it never talks to a provider SDK.

Read `helpers.py` for the helper signatures, `settings.py` for the provider and tier table, `prompts/` for the prompt templates, `rag.py` for ingest and search.

## Commands

| Command | Use it to |
| --- | --- |
| `make rag-ingest` | chunk, embed and store `backend/llm/corpus/` in pgvector; run after adding documents (unchanged files are skipped) |
| `EMBED_PROVIDER=ollama make up` | start the stack with the local `ollama` profile for embeddings, no Gemini key |
| `make logs svc=backend` | follow one LLM call per line (provider, model, tokens, time) and the provider errors |
| `make check` | lint and test the repo, run before every commit |
| `make add-py pkg=<name> extra=llm` | add a dependency to the `[llm]` extra |

## Providers and tiers

`LLM_PROVIDER` picks the provider; helpers default to the `fast` tier, `chat` to `smart`. Pass `model="smart"`, `model="fast"` or a model id to override per call. `LLM_MODEL_FAST` and `LLM_MODEL_SMART` override a tier for every call.

| `LLM_PROVIDER` | `fast` | `smart` | Key |
| --- | --- | --- | --- |
| `groq` (default) | `openai/gpt-oss-20b` | `openai/gpt-oss-120b` | `GROQ_API_KEY` |
| `claude` | `claude-haiku-5-5` | `claude-sonnet-5-5` | `ANTHROPIC_API_KEY` |
| `openrouter` | `openai/gpt-oss-20b:free` | `openai/gpt-oss-120b:free` | `OPENROUTER_API_KEY` |

Only `GROQ_API_KEY` is required to start. `GEMINI_API_KEY` serves embeddings only (`EMBED_PROVIDER=gemini`, the default); `ollama` needs no key. `STT_PROVIDER` (default `groq`, reuses `GROQ_API_KEY`) and `TTS_PROVIDER` (default `browser`: the web app speaks, the backend returns nothing) switch to `elevenlabs` with `ELEVENLABS_API_KEY`, or to `speaches` with the `speech` profile.

Groq's free tier (8K tokens per minute) is the real ceiling: a long prompt or a burst of calls returns a rate-limit `LLMError`. Keep prompts short, give `rag.search` a small `k`, and keep `LLM_CACHE=on` (default): identical calls are answered from `backend/llm/.cache/llm.sqlite`. Set `LLM_CACHE=off` only to see fresh output, and delete the cache file after changing a prompt.

Missing keys raise `LLMError` with the variable to set; the API returns it as the `detail`.

## Features

| Feature | Switch on when | Notes |
| --- | --- | --- |
| `chat` (off by default) | a Beat is a conversation | WebSocket `/api/llm/chat/ws`; frames are in `backend/api/resources/chat/models.py` |
| `rag` (on) | answers must come from the team's documents | `POST /api/rag/ask`; put documents in `backend/llm/corpus/`, then `make rag-ingest` |
| `voice` (off) | a Beat uses spoken input or output | `POST /api/llm/transcribe` and `/api/llm/speak` |

Chat uses RAG per request: send `use_rag: true` and `chat()` adds the top `rag.search` chunks to the system prompt; the `done` frame carries them as `citations`. It applies only while Feature `rag` is on and the corpus is ingested. Switch a Feature in `features.json`, then `make sync`.

Done when the Feature's endpoint answers in `/docs` (REST) or in a socket client (chat).

## Recipes

### New LLM use in a resource

1. Add `prompts/<name>.md`, with `{variables}` and `{output_language}` where the answer is prose. Skip this step when `classify`, `extract` or `summarize` already fits.
2. Call the helper from the resource's router: `classify` for one label, `extract` for typed fields, `summarize`, `chat` for streaming. A prompt of your own calls `render("<name>", ...)` then `settings.get_provider().complete(...)`, wrapped in `cache.cached_call`.
3. For `extract`, define a Pydantic model with every field the UI shows and pass it as `schema`. The helper returns a validated instance.
4. Return a typed response model; the endpoint belongs to the resource (`/api/<resource>/<action>`).

Done when the endpoint returns the expected shape twice, the second answer served from the cache (a faster response, no new call in `make logs svc=backend`).

Prompts live in `prompts/` and endpoints serve one resource each; a generic "ask the model anything" endpoint stays out.

### Add tool calling

No helper wraps tools yet; call the provider client directly inside a new helper in `helpers.py`, and keep it sync.

1. Pick the path by provider: `claude` uses `settings.get_provider().client.messages.create(tools=[...])`; `groq` and `openrouter` use `.client.chat.completions.create(tools=[...])` (OpenAI format).
2. Loop: call the model, run each requested tool, append the result as a tool message, call again until the reply holds no tool call. Cap the loop at 5 rounds.
3. Run one tool call per round on Groq: `gpt-oss` has no parallel tool calls.
4. Add the tool functions to the resource, not to `backend/llm`.

Done when one question needing a tool returns an answer that uses the tool's result, on the provider in `.env`.
