"""
Resume intelligence API router.
It scores resume text, extracts structured sections using Gemini AI, and returns targeted improvement suggestions.
"""
import json
import re
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import ResumeAnalyzeRequest, ResumeAnalyzeResponse
from services.gemini_ai import generate_text

router = APIRouter(prefix="/resume", tags=["resume"])


# Scores raw resume text against a target role and returns ATS-style feedback with extracted sections.
async def analyze_resume_with_ai(raw_text: str, target_role: str) -> ResumeAnalyzeResponse:
    from services.gemini_ai import complete_chat
    prompt = (
        "You are an expert ATS (Applicant Tracking System) and senior technical recruiter. "
        "Analyze the provided resume text against the target role and extract structured information.\n\n"
        f"TARGET ROLE: {target_role}\n\n"
        f"RESUME TEXT:\n{raw_text[:8000]}\n\n"
        "REQUIREMENTS:\n"
        "1. Read the resume and evaluate how well it matches the TARGET ROLE.\n"
        "2. Generate an ATS `score` from 0 to 100 based on keyword match, project impact, and formatting.\n"
        "3. Provide 3-5 highly actionable `suggestions` to improve the resume for this specific role.\n"
        "4. Extract a 2-3 sentence `profile_summary`.\n"
        "5. Extract lists of `extracted_skills`, `extracted_projects`, `extracted_education`, and `extracted_experience` as arrays of strings.\n"
        "6. Make sure project strings and experience strings are concise (1-2 sentences max per item).\n"
    )
    
    # Empty fallback in case of absolute failure
    fallback_json = json.dumps({
        "score": 0,
        "suggestions": ["Failed to analyze resume with AI. Please try again."],
        "extracted_text": raw_text[:5000],
        "extracted_skills": [],
        "extracted_projects": [],
        "extracted_education": [],
        "extracted_experience": [],
        "profile_summary": "AI Analysis unavailable."
    })
    
    content = await complete_chat(
        messages=[{"role": "user", "content": prompt}],
        fallback=fallback_json,
        tools=None,
        response_schema=ResumeAnalyzeResponse
    )
    
    try:
        parsed = ResumeAnalyzeResponse.model_validate_json(content)
        parsed.extracted_text = raw_text[:5000]
        return parsed
    except Exception as e:
        print(f"Error validating structured AI response for resume: {e}")
        # Return fallback on parsing failure
        fb = json.loads(fallback_json)
        return ResumeAnalyzeResponse(**fb)


# Extracts readable text from uploaded resume files and returns a plain string.
async def extract_resume_text(file: UploadFile) -> str:
    content = await file.read()
    filename = (file.filename or "").lower()
    if filename.endswith(".pdf"):
        try:
            import pdfplumber
        except ImportError as exc:
            raise HTTPException(status_code=500, detail="PDF parsing is not installed on this backend.") from exc
        with pdfplumber.open(BytesIO(content)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages).strip()
    if filename.endswith(".docx"):
        try:
            from docx import Document
        except ImportError as exc:
            raise HTTPException(status_code=500, detail="DOCX parsing is not installed on this backend.") from exc
        document = Document(BytesIO(content))
        return "\n".join(paragraph.text for paragraph in document.paragraphs).strip()
    if filename.endswith(".txt"):
        return content.decode("utf-8", errors="ignore").strip()
    raise HTTPException(status_code=400, detail="Upload a PDF, DOCX, or TXT resume.")


# Scores resume text against a target role and returns ATS-style suggestions.
@router.post("/analyze", response_model=ResumeAnalyzeResponse)
async def analyze_resume(request: ResumeAnalyzeRequest) -> ResumeAnalyzeResponse:
    return await analyze_resume_with_ai(request.text, request.target_role)


# Scores an uploaded resume file and returns ATS-style suggestions plus extracted text.
@router.post("/analyze-file", response_model=ResumeAnalyzeResponse)
async def analyze_resume_file(file: UploadFile = File(...), target_role: str = Form("Student")) -> ResumeAnalyzeResponse:
    extracted_text = await extract_resume_text(file)
    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from this resume.")
    return await analyze_resume_with_ai(extracted_text, target_role)
