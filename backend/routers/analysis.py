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
    
    prompt = (
        "You are an expert career coach and hiring manager AI. "
        "Analyze the provided student profile to generate a highly personalized, accurate Dashboard Analysis.\n\n"
        f"TARGET ROLE: {target_role_clean}\n"
        f"USER DESCRIPTION OF TARGET ROLE/GOAL: {request.target_role}\n"
        f"PROFILE SKILLS: {', '.join(request.profile_skills) if request.profile_skills else 'None'}\n"
        f"PROJECTS: {', '.join(request.projects) if request.projects else 'None'}\n"
        f"EXPERIENCE: {', '.join(request.experience) if request.experience else 'None'}\n"
        f"RESUME SCORE: {request.resume_score or 'Not scored'}\n"
        f"LOCATION (City/State): {request.location or 'Unknown'}\n"
        f"COLLEGE/UNIVERSITY: {request.college or 'Unknown'}\n"
        f"DEGREE/COURSE: {request.degree or 'Unknown'}\n"
        f"GOAL: {request.goal_note or 'None'}\n\n"
        
        "REQUIREMENTS:\n"
        "1. In the 'targetRole' field of the output JSON, DO NOT repeat the user's conversational description or sentences. Return ONLY the concise, professional role name/title (e.g., 'Freelance Frontend Developer').\n"
        "2. Identify the top 5 `gaps` (key skills required for the role). Score `current` (0-100) based on their profile, and `target` (0-100) based on role expectations. Set `priority` to Critical, Important, or Polish. Calculate the `gap` as `target - current`.\n"
        "3. Calculate a practical `readinessScore` (0-100) based on how well their current profile matches the target role.\n"
        "4. Generate realistic `strongestSignals` (e.g. 'Strong foundation in Python') and `riskSignals`.\n"
        "5. Generate 4 `nextActions` outlining concrete steps, incorporating their Location/College if helpful.\n"
        "6. Find 6 real-world `courses`. Generate REAL, functional search URLs (e.g. https://www.coursera.org/search?query=Machine+Learning or https://www.udemy.com/courses/search/?q=React).\n"
        "7. Suggest 4 `simulations`/internships. If a Location is provided, suggest finding local internships in that specific city or region. Generate realistic search queries for job boards or internship portals (e.g., https://internshala.com/internships/keywords-ai-engineer).\n"
    )
    
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
