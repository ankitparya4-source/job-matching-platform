from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.embedding import (
    generate_embedding,
    build_job_text,
    build_resume_text,
)
from app.services.matching import (
    cosine_similarity,
    compute_skill_overlap,
    compute_match_score,
)

router = APIRouter(prefix="/api/matching", tags=["Matching"])


class EmbeddingRequest(BaseModel):
    text: str


class JobEmbeddingRequest(BaseModel):
    title: str
    company: str
    description: str
    skills: list[str] = []


class ResumeEmbeddingRequest(BaseModel):
    raw_text: str
    skills: list[str] = []


class MatchRequest(BaseModel):
    resume_text: str
    resume_skills: list[str] = []
    job_title: str
    job_company: str
    job_description: str
    job_skills: list[str] = []


class BatchMatchRequest(BaseModel):
    resume_text: str
    resume_skills: list[str] = []
    jobs: list[JobEmbeddingRequest]


@router.post("/embed")
async def create_embedding(request: EmbeddingRequest):
    try:
        embedding = generate_embedding(request.text)
        return {"embedding": embedding, "dimensions": len(embedding)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/embed/job")
async def create_job_embedding(request: JobEmbeddingRequest):
    try:
        text = build_job_text(
            request.title, request.company,
            request.description, request.skills,
        )
        embedding = generate_embedding(text)
        return {"embedding": embedding, "dimensions": len(embedding)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/embed/resume")
async def create_resume_embedding(request: ResumeEmbeddingRequest):
    try:
        text = build_resume_text(request.raw_text, request.skills)
        embedding = generate_embedding(text)
        return {"embedding": embedding, "dimensions": len(embedding)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/match")
async def match_resume_to_job(request: MatchRequest):
    try:
        resume_text = build_resume_text(request.resume_text, request.resume_skills)
        job_text = build_job_text(
            request.job_title, request.job_company,
            request.job_description, request.job_skills,
        )

        resume_emb = generate_embedding(resume_text)
        job_emb = generate_embedding(job_text)

        semantic_score = cosine_similarity(resume_emb, job_emb)
        skill_overlap = compute_skill_overlap(request.resume_skills, request.job_skills)
        result = compute_match_score(semantic_score, skill_overlap)

        return {"success": True, "match": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/match/batch")
async def batch_match(request: BatchMatchRequest):
    try:
        resume_text = build_resume_text(request.resume_text, request.resume_skills)
        resume_emb = generate_embedding(resume_text)

        results = []
        for job in request.jobs:
            job_text = build_job_text(
                job.title, job.company, job.description, job.skills,
            )
            job_emb = generate_embedding(job_text)
            semantic_score = cosine_similarity(resume_emb, job_emb)
            skill_overlap = compute_skill_overlap(request.resume_skills, job.skills)
            match = compute_match_score(semantic_score, skill_overlap)

            results.append({
                "job_title": job.title,
                "job_company": job.company,
                "match": match,
            })

        results.sort(key=lambda r: r["match"]["total_score"], reverse=True)

        return {"success": True, "matches": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))