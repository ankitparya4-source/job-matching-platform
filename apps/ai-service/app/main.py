from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import resume, matching

app = FastAPI(
    title="JobMatch AI Service",
    description="Resume parsing, skill extraction, and semantic job matching",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(matching.router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "0.2.0",
    }