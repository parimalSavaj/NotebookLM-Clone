# NotebookLM Clone

AI-powered notebook app — upload sources (PDF, text, URL, YouTube), process them in the background, and chat with your documents using RAG.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- API keys: Google OAuth, OpenRouter, Firecrawl, Cloudinary

## Quick Start

### 1. Database (PostgreSQL + pgvector)

```bash
docker compose up -d
```

- Postgres: `localhost:5434`
- pgAdmin: `http://localhost:5050` (admin@admin.com / admin)

### 2. Server

```bash
cd server
cp .env.example .env.local   # fill in your API keys
npm install
npm run db:migrate
npm run dev                   # http://localhost:5000
```

### 3. Client

```bash
cd client
npm install
npm run dev                   # http://localhost:3000
```

### 4. Inngest (Background Jobs)

```bash
cd server
npm run inngest:dev           # http://localhost:8288 (Inngest dashboard)
```

## Running All Together

> Docker must be running first (`docker compose up -d`).

Open 3 terminals:

| Terminal | Command | Port |
|----------|---------|------|
| 1 | `cd server && npm run dev` | 5000 |
| 2 | `cd client && npm run dev` | 3000 |
| 3 | `cd server && npm run inngest:dev` | 8288 |

## Environment Variables

**Server** (`server/.env.local`) — see `server/.env.example` for all required vars.

**Client** (`client/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
