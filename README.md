# 🎯 Job Matching Platform

An AI-powered hiring system that uses **semantic search** and **NLP** to intelligently match candidates with relevant job opportunities.

## ✨ Features

- **AI Resume Parsing** — Upload a PDF resume and automatically extract skills, experience, and education using NLP (spaCy)
- **Semantic Job Matching** — Go beyond keyword matching with vector embeddings that understand meaning (e.g., "Python developer" matches "Software Engineer with Python experience")
- **Recruiter Dashboard** — Post jobs, review ranked candidates, and manage the hiring pipeline
- **Application Tracking** — Full workflow from Applied → Reviewed → Interview → Offer/Rejected
- **Real-Time Notifications** — Instant updates when application status changes

## 🏗️ Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│   Next.js 15 App    │────▶│  Python AI Service   │
│   (App Router)      │     │  (FastAPI)           │
│                     │     │                      │
│  • Frontend UI      │     │  • Resume parsing    │
│  • API Routes       │     │  • Skill extraction  │
│  • Auth (NextAuth)  │     │  • Embeddings (NLP)  │
│  • Prisma ORM       │     │  • Job matching      │
└────────┬────────────┘     └──────────┬───────────┘
         │                             │
         └──────────┬──────────────────┘
                    ▼
         ┌────────────────────┐
         │  PostgreSQL 16     │
         │  + pgvector        │
         │                    │
         │  • User data       │
         │  • Job listings    │
         │  • Applications    │
         │  • Vector embeddings│
         └────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) | SSR, routing, React UI |
| Backend | Next.js API Routes | REST API endpoints |
| AI/ML | Python FastAPI | Resume parsing, embeddings, matching |
| Database | PostgreSQL 16 + pgvector | Relational data + vector search |
| ORM | Prisma | Type-safe database queries |
| Auth | NextAuth.js v5 | Authentication & authorization |
| NLP | spaCy + sentence-transformers | Text processing & embeddings |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Python 3.10+
- Docker & Docker Compose

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/job-matching-platform.git
cd job-matching-platform

# 2. Copy environment variables
cp .env.example .env

# 3. Start the database
docker compose up -d

# 4. Set up the web app
cd apps/web
npm install
npx prisma migrate dev
npm run dev

# 5. Set up the AI service (in a new terminal)
cd apps/ai-service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8000
```

### Access the app

- **Web App**: http://localhost:3000
- **AI Service Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

## 📁 Project Structure

```
job-matching-platform/
├── apps/
│   ├── web/                    # Next.js frontend + API
│   │   ├── src/
│   │   │   ├── app/            # App Router pages & API routes
│   │   │   ├── components/     # Reusable React components
│   │   │   └── lib/            # Utilities & shared logic
│   │   └── prisma/
│   │       └── schema.prisma   # Database schema
│   └── ai-service/             # Python FastAPI microservice
│       ├── app/
│       │   ├── main.py         # FastAPI entry point
│       │   ├── routers/        # API route handlers
│       │   ├── services/       # Business logic
│       │   └── models/         # Data models
│       └── requirements.txt
├── docker-compose.yml          # Local dev environment
├── .env.example                # Environment variable template
└── README.md
```

## 📄 License

MIT
