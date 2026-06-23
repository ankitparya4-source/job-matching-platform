from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os

router = APIRouter(prefix="/api/generate", tags=["generation"])

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_title: str
    job_company: str
    job_description: str
    candidate_name: str

class CoverLetterResponse(BaseModel):
    cover_letter: str

@router.post("/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(request: CoverLetterRequest):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=503, detail="AI generation not configured")

    prompt = f"""Write a professional cover letter for the following job application.
Keep it concise (3-4 paragraphs), genuine, and specific to the role.
Do NOT use generic filler. Reference specific skills from the resume that match the job.
Do NOT include addresses or date headers — just the letter body.

Candidate: {request.candidate_name}

Resume Summary:
{request.resume_text[:2000]}

Job Title: {request.job_title}
Company: {request.job_company}

Job Description:
{request.job_description[:1500]}

Write the cover letter now:"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        return CoverLetterResponse(cover_letter=response.text.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
