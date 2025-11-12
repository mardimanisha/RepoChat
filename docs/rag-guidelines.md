# 🧠 RAG System Guidelines — RepoChat

## Overview
The RAG (Retrieval-Augmented Generation) system powers the core intelligence behind RepoChat — turning repositories into conversational knowledge bases.

---

## 🏗️ Core Stack
- **Language Models:** HuggingFace + Anthropic API
- **Embeddings:** Sentence Transformers / Instructor Models ()
- **Vector DB:** Supabase Vector
- **Workers:** Ingestion jobs via  Node workers
- **Storage:** Supabase Storage (for repo files)

---

## 🧩 Folder Structure
```
packages/rag/
├── src/
│   ├── ingest/
│   │   ├── fetcher.ts
│   │   ├── extractor.ts
│   │   ├── chunker.ts
│   │   ├── embedder.ts
│   │   └── upsertVector.ts
│   ├── retriever/
│   │   └── search.ts
│   ├── generator/
│   │   └── promptBuilder.ts
│   ├── llm/
│   │   └── anthropicClient.ts
│   ├── workers/
│   │   └── ingestWorker.ts
│   └── utils/
│       └── fileHelpers.ts
└── configs/
    └── hf.config.ts
```

---

## ⚙️ Ingestion Pipeline
| Step | Description |
|------|--------------|
| **1. Fetcher** | Clone repo via GitHub API |
| **2. Extractor** | Read files, ignore non-code folders |
| **3. Chunker** | Split files (AST or size-based) |
| **4. Embedder** | Create embeddings via HF model |
| **5. UpsertVector** | Store embeddings in Supabase Vector |

---

## 💭 Chat Flow (Query → Response)
1. User query → Embed query text
2. Vector search (top-k relevant chunks)
3. Build context prompt
4. Send to Anthropic model (Claude / via HF)
5. Return contextual answer + file citations

---

## 🧠 Core Modules
| Module | Purpose |
|---------|----------|
| `embedder.ts` | Calls embedding model to generate vectors |
| `retriever/search.ts` | Performs top-k similarity search |
| `generator/promptBuilder.ts` | Builds contextual prompt |
| `llm/anthropicClient.ts` | Sends prompt → receives LLM response |

---

## 🧰 Configs & Utilities
- **hf.config.ts:** API keys, model names, base URLs
- **utils/fileHelpers.ts:** Handles filtering, reading files, chunk logic

---

## 🧪 Testing & Validation
- Test pipeline on small repos first
- Log embedding counts and vector upserts
- Validate retrieval quality manually via similarity ranking

---

## 🪄 Optimization Ideas
- Cache embeddings for common repos
- Use async batch embeddings
- Add repo summarization model
- Enable hybrid search (text + metadata)

---

## 📊 Future Enhancements
- Add diff-based update (only re-embed changed files)
- Multi-model support (OpenAI, Gemini)
- Smart prompt truncation
