"""
Roadmap API router.
It generates career roadmap text through NVIDIA NIM with deterministic fallback phases.
"""
import json
import re

from fastapi import APIRouter

from models.schemas import RoadmapPhase, RoadmapRequest, RoadmapResponse
from services.nvidia_nim import complete_chat

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


def build_fallback_phases(career_path: str) -> list[RoadmapPhase]:
    role_query = career_path.replace(" ", "%20")
    return [
        RoadmapPhase(
            title="Foundation: role fundamentals",
            timeline="Weeks 1-4",
            skills=["Core role concepts", "Git/GitHub", "Communication", "Portfolio basics"],
            outcome=f"Build the base required for beginner {career_path} screening and publish one clean proof project.",
            focus_areas=["Understand the target role requirements", "Practice fundamentals daily", "Document every project decision"],
            courses=[
                {"title": f"SWAYAM courses for {career_path}", "provider": "SWAYAM", "url": f"https://swayam.gov.in/explorer?searchText={role_query}"},
                {"title": f"freeCodeCamp practice for {career_path}", "provider": "freeCodeCamp", "url": f"https://www.freecodecamp.org/search?query={role_query}"},
            ],
            certifications=[
                {"title": "Role foundation certificate", "provider": "freeCodeCamp / SWAYAM", "url": f"https://swayam.gov.in/explorer?searchText={role_query}"},
            ],
            internships=[
                {"title": "AICTE beginner internship search", "provider": "AICTE Internship Portal", "url": "https://internship.aicte-india.org/"},
            ],
            weekly_actions=[
                "Week 1: define target companies, role keywords, and missing skills.",
                "Week 2: complete one fundamentals course module and push practice work to GitHub.",
                "Week 3: build a small project using the top missing skill.",
                "Week 4: write resume bullets for the project using action, tool, and result.",
            ],
            proof_outputs=["GitHub repository", "One-page project case study", "Updated resume project bullet"],
        ),
        RoadmapPhase(
            title="Build proof: projects and simulations",
            timeline="Weeks 5-8",
            skills=["APIs", "Problem solving", "Testing", "Role-specific tools"],
            outcome=f"Create proof that a recruiter can compare against entry-level {career_path} expectations.",
            focus_areas=["Convert skills into visible work", "Use real data or realistic workflows", "Practice explaining tradeoffs"],
            courses=[
                {"title": f"Coursera catalog for {career_path}", "provider": "Coursera", "url": f"https://www.coursera.org/search?query={role_query}"},
                {"title": f"Forage simulations for {career_path}", "provider": "Forage", "url": f"https://www.theforage.com/simulations?query={role_query}"},
            ],
            certifications=[
                {"title": "Relevant professional certificate search", "provider": "Coursera", "url": f"https://www.coursera.org/search?query={role_query}%20certificate"},
            ],
            internships=[
                {"title": "Forage virtual job simulations", "provider": "Forage", "url": f"https://www.theforage.com/simulations?query={role_query}"},
                {"title": "SWAYAM Plus internships", "provider": "SWAYAM Plus", "url": "https://swayam-plus.swayam2.ac.in/internship"},
            ],
            weekly_actions=[
                "Week 5: choose one company-style problem and write the project scope.",
                "Week 6: build the first working version and collect screenshots/results.",
                "Week 7: complete one virtual job simulation or guided project.",
                "Week 8: polish README, portfolio story, and resume impact bullets.",
            ],
            proof_outputs=["Role-specific project", "Simulation certificate or completion proof", "Portfolio case study"],
        ),
        RoadmapPhase(
            title="Apply: shortlist-ready execution",
            timeline="Weeks 9-12",
            skills=["Resume targeting", "Interview answers", "Applications", "Follow-up"],
            outcome=f"Apply to beginner {career_path} roles with proof-backed stories and a clear skill-gap recovery plan.",
            focus_areas=["Target beginner-friendly roles", "Customize resume for each role", "Practice project explanation"],
            courses=[
                {"title": "Interview preparation practice", "provider": "CareerSpark Mock Interview", "url": "/dashboard/interview"},
            ],
            certifications=[
                {"title": "Finish the highest-signal certificate from earlier phases", "provider": "Selected provider", "url": f"https://www.coursera.org/search?query={role_query}%20certificate"},
            ],
            internships=[
                {"title": f"Live {career_path} internships", "provider": "CareerSpark / Adzuna", "url": "/dashboard/internships"},
                {"title": "Official AICTE internships", "provider": "AICTE Internship Portal", "url": "https://internship.aicte-india.org/"},
            ],
            weekly_actions=[
                "Week 9: shortlist 15 beginner roles and map each requirement to your proof.",
                "Week 10: apply to 5 roles and track status in your profile.",
                "Week 11: run mock interviews and refine weak answers.",
                "Week 12: follow up, improve resume from feedback, and repeat applications.",
            ],
            proof_outputs=["Targeted resume", "Application tracker", "Mock interview feedback", "Follow-up message templates"],
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
        "Return only valid JSON with key phases. Create exactly three 90-day roadmap phases for a Class-12-pass or beginner student. "
        "Each phase object must include: title, timeline, skills array, outcome, focus_areas array, courses array, certifications array, internships array, weekly_actions array, proof_outputs array. "
        "For courses, certifications, and internships, use objects with title, provider, and url. Prefer official or reliable platforms such as SWAYAM, SWAYAM Plus, AICTE Internship Portal, Forage, freeCodeCamp, Coursera, edX, Microsoft Learn, Google Skillshop, AWS Skill Builder, or IBM SkillsBuild when relevant. "
        "The roadmap must help the student move from beginner level to the target role/company style, with concrete proof outputs and application actions. "
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
