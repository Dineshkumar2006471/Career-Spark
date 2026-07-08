"""
Roadmap API router.
It generates career roadmap text through NVIDIA NIM with deterministic fallback phases.
"""
import json
import re

from fastapi import APIRouter

from models.schemas import RoadmapPhase, RoadmapRequest, RoadmapResponse
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


def build_fallback_phases(career_path: str) -> list[RoadmapPhase]:
    role_query = career_path.replace(" ", "%20")
    return [
        RoadmapPhase(
            title="Month 1: Foundation and Role Fundamentals",
            timeline="Weeks 1-4",
            outcome=f"Build the base required for beginner {career_path} screening and publish one clean proof project.",
            detailed_skills=[
                {
                    "skill_name": "Core role concepts",
                    "summary": f"Understand the fundamental terminology and tools for {career_path}.",
                    "courses": [
                        {"title": f"SWAYAM courses for {career_path}", "provider": "SWAYAM", "url": f"https://swayam.gov.in/explorer?searchText={role_query}"}
                    ],
                    "certifications": [
                        {"title": "Role foundation certificate", "provider": "freeCodeCamp / SWAYAM", "url": f"https://swayam.gov.in/explorer?searchText={role_query}"}
                    ]
                },
                {
                    "skill_name": "Git & Version Control",
                    "summary": "Learn to manage code and collaborate with others using Git and GitHub.",
                    "courses": [
                        {"title": "Git for Beginners", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/"}
                    ],
                    "certifications": []
                }
            ],
            step_by_step_plan=[
                {"timeframe": "Week 1", "action": "Define target companies, role keywords, and list missing skills."},
                {"timeframe": "Week 2", "action": "Complete one fundamentals course module and push practice work to GitHub."},
                {"timeframe": "Week 3", "action": "Build a small project using the top missing skill."},
                {"timeframe": "Week 4", "action": "Write resume bullets for the project using action, tool, and result."}
            ],
            proof_outputs=["GitHub repository", "One-page project case study", "Updated resume project bullet"]
        ),
        RoadmapPhase(
            title="Month 2: Build Proof and Simulations",
            timeline="Weeks 5-8",
            outcome=f"Create proof that a recruiter can compare against entry-level {career_path} expectations.",
            detailed_skills=[
                {
                    "skill_name": "APIs and Integration",
                    "summary": "Connect your projects to real-world data and services.",
                    "courses": [
                        {"title": f"Coursera catalog for {career_path}", "provider": "Coursera", "url": f"https://www.coursera.org/search?query={role_query}"}
                    ],
                    "certifications": []
                },
                {
                    "skill_name": "Testing and Problem Solving",
                    "summary": "Ensure your code is reliable by writing automated tests.",
                    "courses": [
                        {"title": f"Forage simulations for {career_path}", "provider": "Forage", "url": f"https://www.theforage.com/simulations?query={role_query}"}
                    ],
                    "certifications": []
                }
            ],
            step_by_step_plan=[
                {"timeframe": "Week 5", "action": "Choose one company-style problem and write the project scope."},
                {"timeframe": "Week 6", "action": "Build the first working version and collect screenshots/results."},
                {"timeframe": "Week 7", "action": "Complete one virtual job simulation or guided project."},
                {"timeframe": "Week 8", "action": "Polish README, portfolio story, and resume impact bullets."}
            ],
            proof_outputs=["Role-specific project", "Simulation certificate or completion proof", "Portfolio case study"]
        ),
        RoadmapPhase(
            title="Month 3: Apply and Shortlist-Ready Execution",
            timeline="Weeks 9-12",
            outcome=f"Apply to beginner {career_path} roles with proof-backed stories and a clear skill-gap recovery plan.",
            detailed_skills=[
                {
                    "skill_name": "Resume Targeting & Interviews",
                    "summary": "Customize your applications and practice answering behavioral and technical questions.",
                    "courses": [
                        {"title": "Interview preparation practice", "provider": "CareerSpark Mock Interview", "url": "/dashboard/interview"}
                    ],
                    "certifications": []
                }
            ],
            step_by_step_plan=[
                {"timeframe": "Week 9", "action": "Shortlist 15 beginner roles and map each requirement to your proof."},
                {"timeframe": "Week 10", "action": "Apply to 5 roles and track status in your profile."},
                {"timeframe": "Week 11", "action": "Run mock interviews and refine weak answers."},
                {"timeframe": "Week 12", "action": "Follow up, improve resume from feedback, and repeat applications."}
            ],
            proof_outputs=["Targeted resume", "Application tracker", "Mock interview feedback", "Follow-up message templates"]
        ),
    ]


# Extracts JSON from an AI response and returns parsed roadmap phases when valid.
def parse_roadmap_phases(content: str) -> list[RoadmapPhase] | None:
    match = re.search(r"\{.*\}", content, re.DOTALL)
    if not match:
        return None
    try:
        payload = json.loads(match.group(0))
        phases = payload.get("phases", [])
        parsed = [RoadmapPhase(**phase) for phase in phases if isinstance(phase, dict)]
        return parsed or None
    except (json.JSONDecodeError, TypeError, ValueError):
        return None


# Calls NVIDIA NIM for roadmap guidance and returns structured phases for UI rendering.
@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest) -> RoadmapResponse:
    fallback_phases = build_fallback_phases(request.career_path)
    fallback = json.dumps({"phases": [phase.model_dump() for phase in fallback_phases]})
    prompt = (
        "Return ONLY valid JSON with key phases. Create a highly detailed 2-3 month step-by-step roadmap for a beginner student. "
        "The roadmap must be broken down into monthly programs (e.g., 'Month 1', 'Month 2'). "
        "Each phase object must include: title (e.g. Month 1: Foundation), timeline (e.g. Weeks 1-4), outcome, "
        "detailed_skills (an array of skill objects), step_by_step_plan (an array of action objects), and proof_outputs (an array of strings). "
        "Each object in detailed_skills must have: skill_name, summary, courses (array of objects with title, provider, url), and certifications (array of objects with title, provider, url). "
        "Each object in step_by_step_plan must have: timeframe (e.g. Week 1, Day 1-3) and action. "
        "CRITICAL: The content MUST NOT be generic. You MUST specifically mention the exact programming languages, tools, frameworks, and real-world projects relevant to the requested Career path. Do not use placeholder terms like 'learn fundamentals' without specifying what those fundamentals are for the role.\n"
        "Prefer official or reliable platforms such as SWAYAM, SWAYAM Plus, AICTE Internship Portal, Forage, freeCodeCamp, Coursera, edX, Microsoft Learn, Google Skillshop, AWS Skill Builder, or IBM SkillsBuild when relevant. "
        "The roadmap must be extremely detailed, actionable, and strictly tailored, helping the student move from beginner level to the target role.\n"
        f"Career path: {request.career_path}. Current skills: {request.current_skills}. Goal note: {request.goal_note or 'none'}."
    )
    content = await complete_chat(
        [{"role": "user", "content": prompt}],
        fallback,
    )
    parsed_phases = parse_roadmap_phases(content)
    used_provider = bool(parsed_phases) and content != fallback and "AI provider note:" not in content
    phases = parsed_phases or fallback_phases
    return RoadmapResponse(
        career_path=request.career_path,
        phases=phases,
        provider_status="nvidia" if used_provider else "fallback",
    )
