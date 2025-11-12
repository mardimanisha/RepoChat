# 🧩 Frontend Guidelines — RepoChat

## Overview
The frontend is built with **Next.js (App Router)** and styled to mirror ChatGPT’s UI. It provides a seamless user experience across authentication, dashboard, and chat views.

---

## 🏗️ Core Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn for components
- **State Management:** React Context
- **Auth:** Supabase Auth (Email/Password + Google OAuth)
- **Deployment:** Vercel

---

## 🧭 Frontend Flow

### 1️⃣ Homepage (Pre-login)
- Hero section: “Chat with any GitHub Repository”
- Input for GitHub URL + CTA “Start Chat”
- Redirect to `/auth` if user not logged in

### 2️⃣ Authentication
- `/auth` route: Sign in / Sign up tabs
- Auth methods:
  - Email & password
  - Google OAuth (Supabase)
- On success → redirect to `/dashboard`

### 3️⃣ Dashboard
- Sidebar with past chats, new chat button, and sign out
- ChatGPT-style main chat area
- Start new repo chat with input field

### 4️⃣ Chat Interface
- Chat layout similar to ChatGPT
- Markdown + code highlighting
- “Copy”, “Cite” options
- Sidebar optional for repo summary / file tree

---

## 🧩 Folder Structure (Frontend)
```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Homepage
│   │   ├── auth/                   # Auth pages
│   │   └── dashboard/              # Main dashboard
│   ├── components/
│   │   ├── ChatWindow/
│   │   ├── RepoInput/
│   │   ├── Sidebar/
│   │   └── AuthModal/
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ChatContext.tsx
│   ├── hooks/
│   ├── styles/
│   └── utils/
└── public/
```

---

## 🧰 Integration Points
- **Supabase Client:** Handles session, user profile, token
- **Server Routes:** `/api/repo/*` and `/api/chat/*`
- **Protected Routes:** Middleware redirects unauthenticated users

---

## 🧱 UI Components
| Component | Purpose |
|------------|----------|
| `RepoInput` | Input for GitHub link |
| `ChatWindow` | Chat messages + markdown/code rendering |
| `Sidebar` | Chat history and navigation |
| `AuthModal` | Login/signup form |
| `Loader` | Ingestion progress display |

---

## 🪄 Styling & UX
- Responsive layout (desktop-first)
- Animated transitions between views
- Syntax highlighting for code
- Dark/light mode ready

---

## 🧩 Future Enhancements
- File explorer sidebar for repo context
- Chat citations linking to file paths
- Persistent settings (theme, chat preferences)
