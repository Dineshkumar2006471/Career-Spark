"""
Roadmap API router.
Generates a deeply personalized career roadmap using Vertex AI that accounts
for the student's EXISTING skills and builds ONLY around the gaps.
"""
import json
import re

from fastapi import APIRouter

from models.schemas import RoadmapPhase, RoadmapRequest, RoadmapResponse
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


# === SYSTEM INSTRUCTION ===
ROADMAP_SYSTEM_INSTRUCTION = """You are a career development director at a top Indian university who has guided 5,000+ students into technology roles across India and globally.

Your roadmap methodology:
- You NEVER generate generic roadmaps. Every phase is customized to the student's current skill level.
- You first identify what the student ALREADY knows, then build the roadmap ONLY around the gaps.
- You suggest courses from REAL platforms with WORKING URLs: SWAYAM, Coursera, Udemy, freeCodeCamp, edX, Microsoft Learn, Google Skillshop, AWS Skill Builder, IBM SkillsBuild.
- You include Indian-specific resources (SWAYAM, NPTEL, Internshala, AICTE portals) whenever relevant.
- Each phase has concrete proof outputs that a recruiter can verify.
- You always respond with valid JSON matching the requested schema.
"""


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


# Calls Vertex AI for roadmap guidance and returns structured phases for UI rendering.
@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest) -> RoadmapResponse:
    fallback_phases = build_fallback_phases(request.career_path)
    fallback = json.dumps({"phases": [phase.model_dump() for phase in fallback_phases]})

    prompt = f"""Generate a highly detailed, personalized 3-month career roadmap for the target career below.

<student_profile>
TARGET CAREER: {request.career_path}
CURRENT SKILLS THE STUDENT ALREADY HAS: {', '.join(request.current_skills) if request.current_skills else 'NONE — complete beginner'}
STUDENT'S GOAL NOTE: {request.goal_note or 'No specific goal provided'}
</student_profile>

<gap_analysis_instructions>
BEFORE building the roadmap, you MUST:
1. List the top 10 skills required for "{request.career_path}".
2. Check which of those skills the student ALREADY has from their current_skills list.
3. Identify the GAPS — skills the student is MISSING.
4. Build the roadmap ONLY around the gaps. Do NOT teach skills the student already knows.
5. If the student already knows a skill, skip it or mention it briefly as "already covered" in the first phase.
</gap_analysis_instructions>

<roadmap_rules>
- Create exactly 3 phases (Month 1, Month 2, Month 3).
- Each phase MUST include:
  - `title`: e.g., "Month 1: Core Python & Data Fundamentals"
  - `timeline`: e.g., "Weeks 1-4"
  - `outcome`: What the student can prove after this phase.
  - `detailed_skills`: Array of skill objects. Each skill object has:
    - `skill_name`: The exact skill (e.g., "TensorFlow", not "ML framework")
    - `summary`: 1-2 sentences explaining what to learn and why
    - `courses`: Array of real courses with `title`, `provider`, and working `url`
    - `certifications`: Array of relevant certifications with `title`, `provider`, and `url`
  - `step_by_step_plan`: Array of weekly actions with `timeframe` and `action`
  - `proof_outputs`: Array of tangible deliverables the student creates

- CRITICAL: Use REAL course URLs. Examples:
  - https://www.coursera.org/search?query=Deep+Learning
  - https://swayam.gov.in/explorer?searchText=Python
  - https://www.udemy.com/courses/search/?q=React
  - https://www.freecodecamp.org/learn/
  - https://learn.microsoft.com/en-us/training/browse/?terms=Azure
  
- CRITICAL: Be SPECIFIC about technologies. Never say "learn fundamentals" — say "Learn Python pandas for data manipulation, focus on DataFrame operations, groupby, and merge."
</roadmap_rules>

Return ONLY valid JSON with a top-level key "phases" containing the array of phase objects."""

    content = await complete_chat(
        messages=[{"role": "user", "content": prompt}],
        fallback=fallback,
        tools=None,
        system_instruction=ROADMAP_SYSTEM_INSTRUCTION,
    )
    parsed_phases = parse_roadmap_phases(content)
    used_provider = bool(parsed_phases) and content != fallback
    phases = parsed_phases or fallback_phases
    return RoadmapResponse(
        career_path=request.career_path,
        phases=phases,
        provider_status="vertex-ai" if used_provider else "fallback",
    )
