"""
Career assessment API router.
It maps onboarding answers into ranked career path suggestions.
"""
import json
import re

from fastapi import APIRouter

from models.schemas import AssessmentAnalyzeRequest, AssessmentAnalyzeResponse, CareerPathMatch
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/assessment", tags=["assessment"])


FALLBACK_MATCHES = [
    CareerPathMatch(id="frontend", title="Frontend Development", match=87, salary="3.5-8 LPA", outlook="High demand for product teams and SaaS startups", summary="Build user interfaces with React, accessibility, performance, and design systems."),
    CareerPathMatch(id="data-analyst", title="Data Analyst", match=78, salary="3-7 LPA", outlook="Strong entry-level demand across operations and finance teams", summary="Turn raw data into decisions using spreadsheets, SQL, dashboards, and Python."),
    CareerPathMatch(id="cloud-support", title="Cloud Support Associate", match=71, salary="3-6.5 LPA", outlook="Growing demand as Indian businesses modernize infrastructure", summary="Help teams run reliable cloud systems through Linux, networking, and AWS basics."),
]


# Extracts career matches from AI JSON and returns fallback results when invalid.
def parse_assessment_matches(content: str) -> list[CareerPathMatch]:
    match = re.search(r"\{.*\}", content, re.DOTALL)
    if not match:
        return FALLBACK_MATCHES
    try:
        payload = json.loads(match.group(0))
        results = [CareerPathMatch(**item) for item in payload.get("results", []) if isinstance(item, dict)]
        return results[:3] or FALLBACK_MATCHES
    except (json.JSONDecodeError, TypeError, ValueError):
        return FALLBACK_MATCHES


# Calls Gemini AI to rank career paths and returns three structured matches.
@router.post("/analyze", response_model=AssessmentAnalyzeResponse)
async def analyze_assessment(request: AssessmentAnalyzeRequest) -> AssessmentAnalyzeResponse:
    fallback = json.dumps({"results": [item.model_dump() for item in FALLBACK_MATCHES]})
    prompt = (
        "Return only valid JSON with key results. Rank exactly three beginner-friendly career paths for a Class-12-pass student. "
        "Each result must include id, title, match integer 0-100, salary, outlook, and summary. "
        f"Answers: {request.answers}."
    )
    content = await complete_chat([{"role": "user", "content": prompt}], fallback)
    return AssessmentAnalyzeResponse(results=parse_assessment_matches(content))
