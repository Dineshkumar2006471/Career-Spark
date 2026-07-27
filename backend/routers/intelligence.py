"""
Career Intelligence API router.
Generates AI-powered career compatibility analysis, industry demand forecasts,
salary estimates, and personalized improvement suggestions using Gemini 2.5 Flash.
"""
import json
import logging

from fastapi import APIRouter, HTTPException

from models.schemas import CareerIntelligenceRequest, CareerIntelligenceResponse
from services.gemini_ai import generate_text

logger = logging.getLogger("careerspark.intelligence")

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


INTELLIGENCE_PROMPT = """You are an expert career market analyst and AI career advisor.
Analyze the following student profile and produce a comprehensive Career Intelligence report.

<profile>
TARGET ROLE: {target_role}
SKILLS: {skills}
PROJECTS: {projects}
EXPERIENCE: {experience}
LOCATION: {location}
GOAL: {goal_note}
</profile>

<instructions>
Produce a JSON object with these exact keys:

1. "compatibility" — An array of exactly 5 objects, each with:
   - "role": a real tech job title relevant to this student's skills (e.g. "Software Developer", "Data Analyst", "AI Engineer", "Cloud Engineer", "Cyber Security")
   - "match_percentage": an integer 0-100 representing how compatible the student is with that role based on their current skills and projects. Be realistic — a student with only HTML/CSS should NOT get 90% for AI Engineer.

2. "industry_demand" — An array of exactly 5 objects representing yearly demand forecast from 2024 to 2028:
   - "year": string like "2024", "2025", etc.
   - "demand_index": integer 0-100 representing relative industry demand for the student's target role
   - "growth_label": null for all years EXCEPT the last year (2028), which should have a label like "+20% Growth" or "+15% Growth" based on realistic growth projections

3. "growth_badge" — A short string like "+20% Growth" summarizing the 5-year growth trend for the target role

4. "expected_salary" — A realistic salary range string in Indian LPA format (e.g. "₹6.5 – 12 LPA") for the student's target role at entry/mid level in India

5. "salary_subtitle" — A short label like "for Software Developer" using the target role

6. "job_opportunities" — A realistic string like "1.8M+" or "500K+" representing approximate job openings for the target role in India

7. "opportunities_subtitle" — "Across India"

8. "growth_rate" — One of "High", "Medium", or "Low" based on the target role's market trajectory

9. "ai_suggestion" — A personalized, specific suggestion (1-2 sentences) telling the student which skills to strengthen or projects to build to increase their career compatibility. Reference their actual skills and gaps. Do NOT be generic.
</instructions>

<output_format>
Return ONLY valid JSON. No markdown fencing, no explanation, no extra text.
</output_format>
"""


@router.post("/analyze", response_model=CareerIntelligenceResponse)
async def analyze_career_intelligence(request: CareerIntelligenceRequest) -> CareerIntelligenceResponse:
    prompt = INTELLIGENCE_PROMPT.format(
        target_role=request.target_role or "Software Developer",
        skills=", ".join(request.profile_skills) if request.profile_skills else "NONE",
        projects=", ".join(request.projects) if request.projects else "NONE",
        experience=", ".join(request.experience) if request.experience else "NONE",
        location=request.location or "India",
        goal_note=request.goal_note or "None provided",
    )

    fallback_json = json.dumps({
        "compatibility": [
            {"role": "Software Developer", "match_percentage": 85},
            {"role": "Data Analyst", "match_percentage": 72},
            {"role": "AI Engineer", "match_percentage": 65},
            {"role": "Cloud Engineer", "match_percentage": 60},
            {"role": "Cyber Security", "match_percentage": 55},
        ],
        "industry_demand": [
            {"year": "2024", "demand_index": 60, "growth_label": None},
            {"year": "2025", "demand_index": 68, "growth_label": None},
            {"year": "2026", "demand_index": 75, "growth_label": None},
            {"year": "2027", "demand_index": 82, "growth_label": None},
            {"year": "2028", "demand_index": 92, "growth_label": "+20% Growth"},
        ],
        "growth_badge": "+20% Growth",
        "expected_salary": "₹6.5 – 12 LPA",
        "salary_subtitle": "for Software Developer",
        "job_opportunities": "1.8M+",
        "opportunities_subtitle": "Across India",
        "growth_rate": "High",
        "ai_suggestion": "Based on your profile, AI recommends strengthening Python and Cloud Computing to unlock higher opportunities.",
    })

    try:
        raw = await generate_text(prompt, fallback=fallback_json, temperature=0.4)
        # Strip markdown fencing if Gemini wraps the JSON
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3].strip()

        data = json.loads(cleaned)
        return CareerIntelligenceResponse(**data)
    except json.JSONDecodeError:
        logger.error("Career Intelligence: Gemini returned non-JSON, using fallback")
        return CareerIntelligenceResponse(**json.loads(fallback_json))
    except Exception as exc:
        logger.error(f"Career Intelligence generation error: {exc}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {exc}")
