# Job Matching Platform

AI-powered hiring platform that connects candidates with relevant jobs using semantic search and NLP. Candidates upload resumes, the system extracts skills and generates vector embeddings, then matches them against job descriptions using cosine similarity — going beyond simple keyword matching.

## Architecture

The platform is split into two services:

- **Web app** (Next.js 15, App Router) — handles the frontend, API routes, auth, and database access via Prisma
- **AI service** (Python, FastAPI) — handles resume parsing, skill extraction with spaCy, and embedding generation with sentence-transformers

Both services share a PostgreSQL 16 database with the pgvector extension for storing and querying vector embeddings.

```
apps/web          →  Next.js 15 + Prisma + NextAuth
apps/ai-service   →  FastAPI + spaCy + sentence-transformers
docker-compose    →  PostgreSQL 16 + pgvector
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), TypeScript |
| Auth | NextAuth.js v5, bcrypt |
| Database | PostgreSQL 16, pgvector, Prisma ORM |
| AI/ML | FastAPI, spaCy, sentence-transformers |
| Infra | Docker Compose |

## Setup

Prerequisites: Node.js 20+, Python 3.10+, Docker

```bash
# clone and configure
git clone https://github.com/ankitparya4-source/job-matching-platform.git
cd job-matching-platform
cp .env.example .env

# start database
docker compose up -d

# web app
cd apps/web
npm install
npx prisma migrate dev
npm run dev

# ai service (separate terminal)
cd apps/ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8000
```

Web app runs at `localhost:3000`, AI service docs at `localhost:8000/docs`.

## Project Structure

```
job-matching-platform/
├── apps/
│   ├── web/                 # Next.js frontend + API
│   │   ├── src/app/         # Pages and API routes
│   │   ├── src/lib/         # Auth config, Prisma client
│   │   └── prisma/          # Schema and migrations
│   └── ai-service/          # Python ML microservice
│       ├── app/routers/     # API endpoints
│       ├── app/services/    # Business logic
│       └── app/models/      # Data models
├── docker-compose.yml
└── .env.example
```

## License

MIT
