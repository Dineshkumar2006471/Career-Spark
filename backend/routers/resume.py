"""
Resume intelligence API router.
It scores pasted resume text and returns targeted improvement suggestions.
"""
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import ResumeAnalyzeRequest, ResumeAnalyzeResponse

router = APIRouter(prefix="/resume", tags=["resume"])


# Scores raw resume text against a target role and returns ATS-style feedback.
def score_resume_text(raw_text: str, target_role: str) -> ResumeAnalyzeResponse:
    text = raw_text.lower()
    keywords = ["project", "react", "api", "git", "javascript", "responsive", "internship"]
    hits = sum(1 for keyword in keywords if keyword in text)
    score = min(95, 45 + hits * 7 + min(len(raw_text) // 300, 10))
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
    return ResumeAnalyzeResponse(score=score, suggestions=suggestions, extracted_text=raw_text[:5000])


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
    return score_resume_text(request.text, request.target_role)


# Scores an uploaded resume file and returns ATS-style suggestions plus extracted text.
@router.post("/analyze-file", response_model=ResumeAnalyzeResponse)
async def analyze_resume_file(file: UploadFile = File(...), target_role: str = Form("Frontend Development")) -> ResumeAnalyzeResponse:
    extracted_text = await extract_resume_text(file)
    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from this resume.")
    return score_resume_text(extracted_text, target_role)
