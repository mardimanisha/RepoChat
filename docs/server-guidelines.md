# ⚙️ Server Guidelines — RepoChat

## Overview
The server layer is powered by **Next.js API Routes** and **Supabase** for persistence and authentication. It handles repo ingestion orchestration, chat processing, and user management.

---

## 🏗️ Core Stack
- **Runtime:** Next.js API routes (Node)
- **Database:** Supabase Postgres + Vector extension
- **Auth:** Supabase (JWT-based)
- **Queue:** Ingestion tasks via background workers
- **Logging:** Winston or pino
- **Deployment:** Vercel Functions or custom Node server

---

## 🧩 Folder Structure (Server)
```
apps/server/
├── src/
│   ├── pages/api/
│   │   ├── auth/
│   │   ├── repo/
│   │   │   ├── validate.ts
│   │   │   └── start-ingest.ts
│   │   ├── chat/
│   │   │   └── message.ts
│   │   └── health.ts
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   ├── auth.ts
│   │   └── logger.ts
│   ├── services/
│   │   ├── repoHandler.ts
│   │   └── chatService.ts
│   └── workers/
│       └── ingestWorkerTrigger.ts
└── infra/
```

---

## 🧠 API Endpoints

### `POST /api/repo/validate`
Validates GitHub repository URL.

### `POST /api/repo/start-ingest`
Triggers ingestion pipeline (cloning, parsing, embedding).

### `POST /api/chat/message`
Handles user query → retrieves embeddings → calls RAG → returns AI response.

---

## 🧩 Services

| Service | Responsibility |
|----------|----------------|
| `repoHandler` | Validates URL, starts ingestion job |
| `chatService` | Performs retrieval + LLM calls |
| `auth` | Manages user sessions via Supabase |

---

## 🧱 Database Models
| Table | Description |
|--------|-------------|
| `users` | Authenticated users |
| `repos` | Repo metadata + embedding status |
| `chats` | Chat sessions per repo |
| `messages` | Conversation history |

---

## 🧩 Middleware & Auth Flow
- Protect `/api/*` routes with Supabase session check
- Use middleware to redirect unauthenticated users
- JWT validated via Supabase client SDK

---

## 🧰 Background Tasks
- Triggered ingestion via worker
- Queue management ( Supabase Functions)
- Store logs of ingestion and chat usage

---

## 🪄 Best Practices
- Modular services (no direct DB calls in routes)
- Reusable Supabase client instance
- Handle async errors gracefully with try/catch
- Cache repo embeddings lookup
