import json
import re

from fastapi import APIRouter

from models.schemas import DashboardAnalysisRequest, DashboardAnalysisResponse, SkillGap, ResourceItem
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/analysis", tags=["analysis"])


def parse_analysis_response(content: str) -> DashboardAnalysisResponse | None:
    match = re.search(r"\{.*\}", content, re.DOTALL)
    if not match:
        return None
    try:
        payload = json.loads(match.group(0))
        return DashboardAnalysisResponse(**payload)
    except (json.JSONDecodeError, TypeError, ValueError) as e:
        print(f"Error parsing AI response: {e}")
        return None


@router.post("/dashboard", response_model=DashboardAnalysisResponse)
async def generate_dashboard_analysis(request: DashboardAnalysisRequest) -> DashboardAnalysisResponse:
    # Google Search Grounding is not supported on this standard API key, so we do not pass tools
    tools = None
    
    # Clean target role to make sure it's just the role name/title, not the entire verbose user sentence
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
        f"GOAL: {request.goal_note or 'None'}\n\n"
        
        "REQUIREMENTS:\n"
        "1. In the 'targetRole' field of the output JSON, DO NOT repeat the user's conversational description or sentences. Return ONLY the concise, professional role name/title (e.g., 'Freelance Frontend Developer').\n"
        "2. Identify the top 5 `gaps` (key skills required for the role). Score `current` (0-100) based on their profile, and `target` (0-100) based on role expectations. Set `priority` to Critical, Important, or Polish. Calculate the `gap` as `target - current` (can be 0 or negative if current >= target).\n"
        "3. Calculate a practical `readinessScore` (0-100) based on how well their current profile matches the target role.\n"
        "4. Generate realistic `strongestSignals` (e.g. '3 projects matching role') and `riskSignals` (e.g. 'No cloud experience').\n"
        "5. Generate 4 `nextActions` outlining concrete steps.\n"
        "6. Find 6 real-world `courses` and 4 `simulations`/internships directly relevant to the TARGET ROLE and the identified skill gaps. For each, include `title`, `provider`, `type`, `price`, `reason`, a REAL `url` (e.g. https://www.coursera.org/ or https://www.udemy.com/), and a REAL image `logo` URL if available (otherwise null).\n"
        
        "Return ONLY valid JSON matching this structure perfectly:\n"
        "{\n"
        '  "targetRole": "string",\n'
        '  "readinessScore": number,\n'
        '  "resumeScore": number | null,\n'
        '  "gaps": [{ "skill": "string", "current": number, "target": number, "gap": number, "priority": "string", "reason": "string" }],\n'
        '  "strongestSignals": ["string"],\n'
        '  "riskSignals": ["string"],\n'
        '  "nextActions": ["string"],\n'
        '  "courses": [{ "title": "string", "provider": "string", "type": "string", "price": "string", "reason": "string", "url": "string", "skill": "string", "logo": "string" }],\n'
        '  "simulations": [{ "title": "string", "provider": "string", "type": "string", "price": "string", "reason": "string", "url": "string", "logo": "string" }]\n'
        "}\n"
    )
    
    # Fallback in case of absolute failure
    fallback_json = json.dumps({
        "targetRole": request.target_role or "Student",
        "readinessScore": 30,
        "resumeScore": request.resume_score,
        "gaps": [{"skill": "Core Concepts", "current": 20, "target": 80, "gap": 60, "priority": "Critical", "reason": "Base requirement"}],
        "strongestSignals": ["Profile created"],
        "riskSignals": ["Missing role-specific data"],
        "nextActions": ["Add more skills to your profile"],
        "courses": [{"title": "Course fallback - Please try again", "provider": "CareerSpark", "type": "Course", "price": "Free", "reason": "AI quota exceeded", "url": "#", "skill": "Core", "logo": None}],
        "simulations": []
    })

    content = await complete_chat(
        messages=[{"role": "user", "content": prompt}],
        fallback=fallback_json,
        tools=tools,
        response_schema=DashboardAnalysisResponse
    )
    
    try:
        parsed = DashboardAnalysisResponse.model_validate_json(content)
    except Exception as e:
        print(f"Error validating structured AI response in analysis.py: {e}\nContent was: {content[:200]}...")
        parsed = DashboardAnalysisResponse.model_validate_json(fallback_json)
        
    # Extra safety check: if targetRole still has the verbose prompt, clean it
    if "freelanc" in parsed.targetRole.lower():
        if "react" in "".join(request.profile_skills).lower() or "frontend" in parsed.targetRole.lower():
            parsed.targetRole = "Freelance Frontend Developer"
        else:
            parsed.targetRole = "Freelance Developer"
            
    return parsed
