# =============================================================================
# AI Service — Main Application Entry Point
# =============================================================================
# This is the FastAPI application that handles:
#   1. Resume PDF parsing (extract text from uploaded PDFs)
#   2. Skill extraction (NLP-based identification of skills from text)
#   3. Embedding generation (convert text to vectors for semantic search)
#   4. Job matching (compare resume vectors with job description vectors)
#
# Run with: uvicorn app.main:app --reload --port 8000
# =============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI application
app = FastAPI(
    title="Job Matching AI Service",
    description="AI-powered resume parsing, skill extraction, and job matching",
    version="0.1.0",
    docs_url="/docs",       # Swagger UI at http://localhost:8000/docs
    redoc_url="/redoc",     # ReDoc at http://localhost:8000/redoc
)

# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------
# This allows our Next.js frontend (running on port 3000) to call this API
# (running on port 8000). Without CORS, the browser would block the requests.
#
# In production, you'd restrict 'allow_origins' to your actual domain.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health Check Endpoint
# ---------------------------------------------------------------------------
# Every professional API has a health check. It's used by:
#   - Docker to know if the container is healthy
#   - Load balancers to route traffic to healthy instances
#   - Monitoring tools to alert when something is down
# ---------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "0.1.0",
    }


@app.get("/")
async def root():
    return {
        "message": "Job Matching AI Service",
        "docs": "Visit /docs for API documentation",
    }
