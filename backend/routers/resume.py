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


# Extracts structured sections from resume text using Gemini AI.
async def extract_resume_sections(raw_text: str) -> dict:
    prompt = (
        "Analyze this resume text and extract structured information. Return ONLY valid JSON with these keys:\n"
        '- "profile_summary": a 2-3 sentence professional summary\n'
        '- "skills": array of skill strings found\n'
        '- "projects": array of project name/description strings\n'
        '- "education": array of education entries (degree, institution)\n'
        '- "experience": array of experience entries (role, company, duration)\n'
        '- "achievements": array of achievement strings\n'
        '- "courses_certifications": array of course/certification strings\n\n'
        f"Resume text:\n{raw_text[:4000]}"
    )
    fallback = json.dumps({
        "profile_summary": "",
        "skills": [],
        "projects": [],
        "education": [],
        "experience": [],
        "achievements": [],
        "courses_certifications": [],
    })
    result = await generate_text(prompt, fallback)
    try:
        match = re.search(r"\{.*\}", result, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except (json.JSONDecodeError, TypeError):
        pass
    return json.loads(fallback)


# Scores raw resume text against a target role and returns ATS-style feedback with extracted sections.
async def score_resume_text(raw_text: str, target_role: str) -> ResumeAnalyzeResponse:
    text = raw_text.lower()
    keywords = ["project", "react", "api", "git", "javascript", "responsive", "internship", "python", "sql", "data", "machine learning", "certification", "course"]
    hits = sum(1 for keyword in keywords if keyword in text)
    score = min(95, 45 + hits * 5 + min(len(raw_text) // 300, 10))
    suggestions = []
    if "project" not in text:
        suggestions.append("Add at least one project with a measurable outcome.")
    if target_role.lower().startswith("frontend") and "react" not in text:
        suggestions.append("Mention React component work and API integration if you have done it.")
    if "github" not in text:
        suggestions.append("Add a GitHub link so reviewers can verify your work.")
    if len(raw_text.split()) < 120:
        suggestions.append("Add more concrete bullets. A recruiter needs enough detail to understand scope, tools, and outcomes.")
    if not suggestions:
        suggestions.append("Good baseline. Tighten bullet points with numbers, tools, and outcomes.")

    # Extract structured sections using Gemini AI
    sections = await extract_resume_sections(raw_text)

    def _to_str_list(items):
        if not isinstance(items, list):
            return []
        out = []
        for item in items:
            if isinstance(item, dict):
                out.append(" - ".join(str(v) for v in item.values() if v))
            else:
                out.append(str(item))
        return out

    return ResumeAnalyzeResponse(
        score=score,
        suggestions=suggestions,
        extracted_text=raw_text[:5000],
        extracted_skills=_to_str_list(sections.get("skills", [])),
        extracted_projects=_to_str_list(sections.get("projects", [])),
        extracted_education=_to_str_list(sections.get("education", [])),
        extracted_experience=_to_str_list(sections.get("experience", [])),
        profile_summary=str(sections.get("profile_summary", "")),
    )


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
    return await score_resume_text(request.text, request.target_role)


# Scores an uploaded resume file and returns ATS-style suggestions plus extracted text.
@router.post("/analyze-file", response_model=ResumeAnalyzeResponse)
async def analyze_resume_file(file: UploadFile = File(...), target_role: str = Form("Frontend Development")) -> ResumeAnalyzeResponse:
    extracted_text = await extract_resume_text(file)
    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from this resume.")
    return await score_resume_text(extracted_text, target_role)
