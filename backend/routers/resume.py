"""
Resume intelligence API router.
Scores resume text using a structured ATS rubric, extracts sections via Gemini AI,
and returns targeted improvement suggestions cross-referenced against the target role.
"""
import json
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import ResumeAnalyzeRequest, ResumeAnalyzeResponse
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/resume", tags=["resume"])


# === SYSTEM INSTRUCTION (Persona Definition) ===
RESUME_SYSTEM_INSTRUCTION = """You are a senior ATS (Applicant Tracking System) algorithm combined with a human recruiter who has screened 10,000+ resumes for technology companies.

Your evaluation methodology:
- You score resumes using a strict, point-based rubric. You never inflate scores.
- You cross-reference every claimed skill against the projects and experience sections. If a skill is listed but never demonstrated in any project or job, you flag it.
- You check for quantified achievements (numbers, percentages, metrics). Resumes without metrics score lower.
- You extract structured data precisely — skills, projects, education, experience — as clean arrays.
- Your suggestions are specific and actionable. Never say "improve your resume" — say exactly WHAT to change and HOW.
"""


# Scores raw resume text against a target role and returns ATS-style feedback with extracted sections.
async def analyze_resume_with_ai(raw_text: str, target_role: str) -> ResumeAnalyzeResponse:
    prompt = f"""Analyze this resume against the target role of **{target_role}** using the scoring rubric below.

<resume_text>
{raw_text[:8000]}
</resume_text>

<target_role>{target_role}</target_role>

<scoring_rubric>
Score the resume using this point-based system (total = 100 points):

1. KEYWORD MATCH FOR TARGET ROLE (0-25 points):
   - List the top 10 keywords/skills a recruiter would search for when hiring a "{target_role}".
   - For each keyword present in the resume, award 2.5 points.
   - If the keyword appears in BOTH the skills section AND a project/experience description, award full points.
   - If it appears only in a skills list with no supporting evidence, award half points.

2. QUANTIFIED ACHIEVEMENTS (0-20 points):
   - Does the resume contain measurable outcomes? (e.g., "Improved load time by 40%", "Served 500+ users")
   - 4+ quantified achievements = 20 points.
   - 2-3 quantified achievements = 12 points.
   - 1 quantified achievement = 6 points.
   - 0 quantified achievements = 0 points.

3. PROJECT RELEVANCE TO TARGET ROLE (0-20 points):
   - Are the projects directly relevant to "{target_role}"?
   - Each directly relevant project = 5 points (max 20).
   - Generic/unrelated projects score 1 point each.

4. EDUCATION AND CERTIFICATIONS (0-15 points):
   - Degree directly relevant to target role = 10 points.
   - Relevant certifications mentioned = up to 5 bonus points.
   - No education section = 0 points.

5. FORMATTING AND ATS COMPATIBILITY (0-10 points):
   - Clear section headers (Education, Experience, Skills, Projects) = 4 points.
   - Consistent date formatting = 2 points.
   - No excessive formatting that ATS scanners would miss = 2 points.
   - Contact information present = 2 points.

6. CONSISTENCY CHECK (0-10 points):
   - Do claimed skills actually appear in project descriptions? If skills are listed but never used anywhere, deduct points.
   - Are experience dates logical and non-overlapping?
   - Full consistency = 10 points. Each inconsistency = -3 points.
</scoring_rubric>

<extraction_rules>
Extract the following as clean arrays of strings:
- `extracted_skills`: Every technical and soft skill mentioned anywhere in the resume.
- `extracted_projects`: Each project as a concise 1-2 sentence summary including the tech stack used.
- `extracted_education`: Each education entry as "Degree — Institution — Year" format.
- `extracted_experience`: Each work experience as "Role — Company — Duration — Key achievement" format.
- `profile_summary`: A 2-3 sentence professional summary of the candidate based on the resume content.
</extraction_rules>

<suggestion_rules>
Provide 3-5 highly specific, actionable suggestions to improve this resume for the "{target_role}" role.
- Each suggestion must reference a SPECIFIC part of the resume.
- Each suggestion must explain WHAT to change and WHY it matters for ATS scoring.
- Example of a GOOD suggestion: "Add metrics to your 'E-commerce Platform' project — quantify the number of users, transactions processed, or performance improvements to increase your ATS score by ~10 points."
- Example of a BAD suggestion: "Improve your projects section." (Too vague — never do this.)
</suggestion_rules>"""

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
        response_schema=ResumeAnalyzeResponse,
        system_instruction=RESUME_SYSTEM_INSTRUCTION,
    )

    try:
        parsed = ResumeAnalyzeResponse.model_validate_json(content)
        parsed.extracted_text = raw_text[:5000]
        return parsed
    except Exception as e:
        print(f"Error validating structured AI response for resume: {e}")
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
