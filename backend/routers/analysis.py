import json
import re
import urllib.parse

from fastapi import APIRouter

from models.schemas import DashboardAnalysisRequest, DashboardAnalysisResponse, SkillGap, ResourceItem
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/analysis", tags=["analysis"])

# Fallback and static mapping functions have been removed. AI is now the sole source of truth.


from fastapi import APIRouter, HTTPException

@router.post("/dashboard", response_model=DashboardAnalysisResponse)
async def generate_dashboard_analysis(request: DashboardAnalysisRequest) -> DashboardAnalysisResponse:
    tools = None
    
    target_role_clean = request.target_role
    if "freelanc" in request.target_role.lower():
        if "react" in "".join(request.profile_skills).lower() or "frontend" in request.target_role.lower():
            target_role_clean = "Freelance Frontend Developer"
        else:
            target_role_clean = "Freelance Developer"
    
    prompt = f"""
You are an expert career coach and hiring manager AI. Analyze the provided student profile to generate a highly personalized, accurate Dashboard Analysis.

<context>
TARGET ROLE: {target_role_clean}
USER DESCRIPTION OF TARGET ROLE/GOAL: {request.target_role}
PROFILE SKILLS: {', '.join(request.profile_skills) if request.profile_skills else 'None'}
PROJECTS: {', '.join(request.projects) if request.projects else 'None'}
EXPERIENCE: {', '.join(request.experience) if request.experience else 'None'}
RESUME SCORE: {request.resume_score or 'Not scored'}
LOCATION: {request.location or 'Unknown'}
COLLEGE/UNIVERSITY: {request.college or 'Unknown'}
DEGREE/COURSE: {request.degree or 'Unknown'}
GOAL NOTE: {request.goal_note or 'None'}
GITHUB URL: {request.github_url or 'None provided'}
LINKEDIN URL: {request.linkedin_url or 'None provided'}
PORTFOLIO URL: {request.portfolio_url or 'None provided'}
</context>

<task>
1. Evaluate the student's profile against the `{target_role_clean}` role.
2. Calculate a `readinessScore` (0-100). Use abductive reasoning to penalize the score heavily if the target role is technical (e.g., Engineer, Developer) and the user has NO GitHub or Portfolio URL. A missing GitHub for an AI/Software role is a major red flag.
3. Identify the top 5 `gaps`. If external links (GitHub/Portfolio) are missing, make building/linking them a 'Critical' gap. Calculate `gap` as `target - current`.
4. Generate `strongestSignals` (e.g., 'Strong foundation in Python') and `riskSignals` (e.g., 'No GitHub portfolio linked to verify coding skills').
5. Generate 4 `nextActions` outlining concrete steps, incorporating their Location/College or missing social links if helpful.
6. Find 6 real-world `courses` with functional search URLs (e.g., https://www.coursera.org/search?query=Machine+Learning).
7. Suggest 4 `simulations`/internships. Use the user's Location to generate realistic local job board search URLs.
</task>

<constraints>
- In the 'targetRole' field, return ONLY the concise, professional role title (e.g., 'AI Engineer', NOT sentences).
- Strictly adhere to the requested JSON schema.
- Be brutally honest in scoring. Do not inflate the readiness score if proof (projects/links) is missing.
</constraints>
"""
    
    # We pass empty fallback_json, but if it fails we explicitly raise a 503 instead of hiding the error
    fallback_json = "{}"

    content = await complete_chat(
        messages=[{"role": "user", "content": prompt}],
        fallback=fallback_json,
        tools=tools,
        response_schema=DashboardAnalysisResponse
    )
    
    if content == "{}" or not content:
         raise HTTPException(status_code=503, detail="AI Reasoning Engine is currently unavailable due to high load or quota limits. Please try again in a few minutes.")

    try:
        parsed = DashboardAnalysisResponse.model_validate_json(content)
    except Exception as e:
        print(f"Error validating structured AI response in analysis.py: {e}\nContent was: {content[:200]}...")
        raise HTTPException(status_code=503, detail="Failed to parse AI response. The reasoning engine returned malformed data.")
        
    if "freelanc" in parsed.targetRole.lower():
        if "react" in "".join(request.profile_skills).lower() or "frontend" in parsed.targetRole.lower():
            parsed.targetRole = "Freelance Frontend Developer"
        else:
            parsed.targetRole = "Freelance Developer"
            
    return parsed
