"""
Dashboard Analysis API router.
Generates deeply personalized career readiness analysis using Vertex AI with
structured prompting, weighted scoring rubrics, and chain-of-thought reasoning.
"""
import json

from fastapi import APIRouter, HTTPException

from models.schemas import DashboardAnalysisRequest, DashboardAnalysisResponse
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/analysis", tags=["analysis"])


# === SYSTEM INSTRUCTION (Persona Definition) ===
# Separated from user content per Google's official prompting best practices.
SYSTEM_INSTRUCTION = """You are a senior technical hiring manager at a top-tier technology company with 15 years of experience screening candidates for engineering, data science, product, and design roles.

Your evaluation methodology:
- You cross-reference EVERY data point the candidate provides against the target role requirements.
- You never inflate scores. A student with 2 projects and no GitHub gets a low score, period.
- You treat missing evidence (no GitHub, no portfolio, no internship) as a NEGATIVE signal, not neutral.
- You reason step-by-step before producing any score.
- You produce actionable, specific feedback — never generic advice like "learn more" or "improve skills".
"""


@router.post("/dashboard", response_model=DashboardAnalysisResponse)
async def generate_dashboard_analysis(request: DashboardAnalysisRequest) -> DashboardAnalysisResponse:
    # Normalize freelance roles
    target_role_clean = request.target_role
    if "freelanc" in request.target_role.lower():
        if "react" in "".join(request.profile_skills).lower() or "frontend" in request.target_role.lower():
            target_role_clean = "Freelance Frontend Developer"
        else:
            target_role_clean = "Freelance Developer"

    # Build the structured user prompt with XML-delimited sections
    prompt = f"""Analyze this candidate's profile for the role of **{target_role_clean}** and produce a complete Dashboard Analysis.

<profile>
TARGET ROLE: {target_role_clean}
USER'S OWN DESCRIPTION OF GOAL: {request.target_role}
SKILLS LISTED IN PROFILE (Includes Manual + Resume Extracted Skills): {', '.join(request.profile_skills) if request.profile_skills else 'NONE'}
PROJECTS LISTED IN PROFILE (Includes Manual + Resume Extracted Projects): {', '.join(request.projects) if request.projects else 'NONE'}
WORK EXPERIENCE (Includes Manual + Resume Extracted Experience): {', '.join(request.experience) if request.experience else 'NONE'}
LATEST RESUME ATS SCORE: {request.resume_score if request.resume_score is not None else 'No resume uploaded yet'}
LOCATION: {request.location or 'Not provided'}
COLLEGE/UNIVERSITY: {request.college or 'Not provided'}
DEGREE/COURSE: {request.degree or 'Not provided'}
GOAL NOTE: {request.goal_note or 'None'}
GITHUB URL: {request.github_url or 'NOT PROVIDED — candidate has no GitHub linked'}
LINKEDIN URL: {request.linkedin_url or 'NOT PROVIDED — candidate has no LinkedIn linked'}
PORTFOLIO URL: {request.portfolio_url or 'NOT PROVIDED — candidate has no portfolio linked'}
</profile>

<evaluation_criteria>
Score the candidate using this weighted rubric (total = 100 points):

1. SKILLS MATCH (30 points):
   - List the top 8 skills required for "{target_role_clean}".
   - For each skill the candidate HAS listed, award proportional points.
   - If the candidate lists 0 skills, this section scores 0.

2. PROJECT RELEVANCE (25 points):
   - Are the listed projects directly relevant to "{target_role_clean}"?
   - A generic "todo app" for an AI Engineer role scores near 0.
   - Projects with measurable outcomes (metrics, users, performance) score higher.
   - If no projects listed, this section scores 0.

3. PROFESSIONAL PRESENCE (20 points):
   - GitHub linked AND has repositories? +8 points.
   - LinkedIn linked AND complete? +6 points.
   - Portfolio linked AND showcases work? +6 points.
   - If ALL THREE are missing, this section scores 0 and becomes a Critical gap.

4. EXPERIENCE ALIGNMENT (15 points):
   - Internships or work experience in the target field? +15 points.
   - Related but different field? +5-8 points.
   - No experience at all? 0 points.

5. EDUCATION FIT (10 points):
   - Degree directly relevant (e.g., CS degree for Software Engineer)? +10.
   - Adjacent degree (e.g., Electronics for Data Science)? +5.
   - Unrelated degree? +2.
   - Not provided? +1.
</evaluation_criteria>

<reasoning_instructions>
BEFORE producing the final JSON output, you MUST internally reason through each of the 5 criteria above. For each criterion:
1. State what evidence the candidate provides.
2. Identify what is MISSING.
3. Assign a sub-score.
4. Sum all sub-scores to get the final readinessScore.

Then identify the top 5 skill gaps. For each gap:
- `current`: How proficient is the candidate NOW (0-100) based on their listed skills and projects?
- `target`: What level does the role REQUIRE (0-100)?
- `gap`: target minus current.
- `priority`: "Critical" if gap > 60, "Important" if gap > 30, "Polish" if gap <= 30.
- `reason`: A specific, actionable explanation of WHY this gap matters for the target role.
</reasoning_instructions>

<output_rules>
- `targetRole`: Return ONLY the clean professional title (e.g., "AI Engineer"). Never return sentences.
- `readinessScore`: The weighted sum from the evaluation criteria (0-100). Do NOT inflate.
- `resumeScore`: Pass through the value {request.resume_score if request.resume_score is not None else 'null'}.
- `gaps`: Exactly 5 skill gaps, ordered by priority (Critical first).
- `strongestSignals`: 2-4 genuine strengths based ONLY on evidence in the profile. If the profile is weak, list fewer signals.
- `riskSignals`: 2-4 honest risks. Missing GitHub/LinkedIn/Portfolio for a tech role is ALWAYS a risk signal.
- `nextActions`: 4 concrete, specific next steps. Include the candidate's location/college if useful. Never say "learn more" — say exactly WHAT to learn and WHERE.
- `courses`: 6 real courses with working search URLs from Coursera, Udemy, edX, SWAYAM, freeCodeCamp, or Google Skillshop. Format: https://www.coursera.org/search?query=Machine+Learning
- `simulations`: 4 internship/simulation opportunities. Use the candidate's location for local job board URLs (Internshala, LinkedIn Jobs, Naukri). Format: https://internshala.com/internships/keywords-ai-engineer
</output_rules>"""

    fallback_json = "{}"

    content = await complete_chat(
        messages=[{"role": "user", "content": prompt}],
        fallback=fallback_json,
        tools=None,
        response_schema=DashboardAnalysisResponse,
        system_instruction=SYSTEM_INSTRUCTION,
    )

    if content == "{}" or not content:
        raise HTTPException(
            status_code=503,
            detail="AI Reasoning Engine is currently unavailable due to high load or quota limits. Please try again in a few minutes."
        )

    try:
        parsed = DashboardAnalysisResponse.model_validate_json(content)
    except Exception as e:
        print(f"Error validating structured AI response in analysis.py: {e}\nContent was: {content[:300]}...")
        raise HTTPException(
            status_code=503,
            detail="Failed to parse AI response. The reasoning engine returned malformed data."
        )

    # Normalize freelance role titles in output
    if "freelanc" in parsed.targetRole.lower():
        if "react" in "".join(request.profile_skills).lower() or "frontend" in parsed.targetRole.lower():
            parsed.targetRole = "Freelance Frontend Developer"
        else:
            parsed.targetRole = "Freelance Developer"

    return parsed
