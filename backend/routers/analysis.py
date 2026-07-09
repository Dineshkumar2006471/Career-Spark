import json
import re
import urllib.parse

from fastapi import APIRouter

from models.schemas import DashboardAnalysisRequest, DashboardAnalysisResponse, SkillGap, ResourceItem
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/analysis", tags=["analysis"])

# Role-to-skills mapping mirrors frontend careerAnalysis.js for consistent fallback
ROLE_SKILL_MAP = {
    "ai": ["Python", "Machine Learning", "Deep Learning", "TensorFlow/PyTorch", "Math & Statistics", "NLP", "Data Preprocessing", "Model Deployment"],
    "ml": ["Python", "Machine Learning", "Deep Learning", "TensorFlow/PyTorch", "Math & Statistics", "NLP", "Data Preprocessing", "Model Deployment"],
    "data": ["Excel", "SQL", "Python", "Statistics", "Power BI", "Dashboards", "Storytelling"],
    "cloud": ["Linux", "Networking", "AWS", "Troubleshooting", "Security basics", "Documentation"],
    "backend": ["Python", "APIs", "Databases", "Authentication", "Testing", "Deployment"],
    "frontend": ["HTML/CSS", "JavaScript", "React", "Git", "APIs", "Accessibility", "Testing", "Portfolio"],
    "design": ["Figma", "UX research", "Wireframes", "Prototyping", "Design systems"],
    "devops": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS/GCP", "Terraform", "Monitoring", "Scripting"],
    "mobile": ["React Native", "Flutter", "Swift/Kotlin", "Mobile UI", "App Store Deployment", "APIs", "Testing"],
    "fullstack": ["HTML/CSS", "JavaScript", "React", "Node.js", "Databases", "APIs", "Git", "Deployment"],
    "cybersecurity": ["Networking", "Linux", "Cryptography", "Penetration Testing", "SIEM", "Security Frameworks", "Incident Response"],
    "product": ["User Research", "Roadmapping", "Agile/Scrum", "Data Analytics", "Wireframing", "Stakeholder Management"],
    "marketing": ["SEO", "Content Strategy", "Analytics", "Social Media", "Email Marketing", "Copywriting"],
    "blockchain": ["Solidity", "Smart Contracts", "Web3.js", "Cryptography", "DeFi", "Ethereum"],
    "game": ["Unity/Unreal", "C#/C++", "Game Physics", "3D Modeling", "Shaders", "Game Design"],
    "embedded": ["C/C++", "Microcontrollers", "RTOS", "PCB Design", "Communication Protocols", "Debugging"],
}


def _match_role_skills(target_role: str) -> list[str]:
    """Returns the skill list matching the target role from ROLE_SKILL_MAP."""
    role = target_role.lower()
    checks = [
        (["ai", "artificial intelligence"], "ai"),
        (["machine learning", "ml engineer"], "ml"),
        (["data"], "data"),
        (["cloud"], "cloud"),
        (["devops", "sre", "infrastructure"], "devops"),
        (["mobile", "android", "ios", "flutter"], "mobile"),
        (["fullstack", "full stack", "full-stack"], "fullstack"),
        (["backend", "back-end", "back end"], "backend"),
        (["design", "ui", "ux"], "design"),
        (["frontend", "front-end", "react"], "frontend"),
        (["cyber", "security", "infosec"], "cybersecurity"),
        (["product manager", "product management"], "product"),
        (["marketing", "growth"], "marketing"),
        (["blockchain", "web3", "crypto"], "blockchain"),
        (["game", "unity", "unreal"], "game"),
        (["embedded", "iot", "firmware"], "embedded"),
    ]
    for keywords, key in checks:
        if any(kw in role for kw in keywords):
            return ROLE_SKILL_MAP[key]
    return ["Communication", "Problem Solving", "Project Management", "Technical Skills", "Portfolio"]


def _slug(value: str) -> str:
    return urllib.parse.quote(value.replace("/", " "), safe="")


def _build_local_fallback(request: DashboardAnalysisRequest) -> DashboardAnalysisResponse:
    """Builds a fully populated fallback response from request data alone (no AI needed)."""
    target_role = request.target_role or "Student"
    profile_skills_lower = [s.lower() for s in request.profile_skills]
    target_skills = _match_role_skills(target_role)

    # Build skill gaps
    gaps = []
    for skill in target_skills[:8]:
        has_skill = any(skill.lower() in ps or ps in skill.lower() for ps in profile_skills_lower)
        current = 55 if has_skill else 15
        target = 85
        gap = max(0, target - current)
        priority = "Critical" if gap >= 35 else ("Important" if gap >= 18 else "Polish")
        reason = (
            f"Strong foundation in {skill}" if has_skill
            else f"No evidence of {skill} in your profile yet"
        )
        gaps.append(SkillGap(skill=skill, current=current, target=target, gap=gap, priority=priority, reason=reason))
    gaps.sort(key=lambda g: g.gap, reverse=True)

    # Readiness score
    resume_score = request.resume_score or 50
    project_count = len(request.projects)
    exp_count = len(request.experience)
    skills_matched = sum(1 for g in gaps if g.current >= 50)
    readiness = min(99, max(5, int(
        resume_score * 0.3 +
        min(25, project_count * 8) +
        min(15, exp_count * 5) +
        min(20, skills_matched * 5) +
        5
    )))

    # Strongest signals
    strongest = []
    if request.profile_skills:
        strongest.append(f"{len(request.profile_skills)} skills listed in profile")
    if request.projects:
        strongest.append(f"{project_count} project{'s' if project_count != 1 else ''} added")
    if request.experience:
        strongest.append(f"{exp_count} experience item{'s' if exp_count != 1 else ''}")
    if request.resume_score:
        strongest.append(f"Resume scored {request.resume_score}/100")
    if not strongest:
        strongest.append("Profile created — good start!")

    # Risk signals
    risks = []
    critical_gaps = [g for g in gaps if g.priority == "Critical"]
    if critical_gaps:
        risks.append(f"{critical_gaps[0].skill} is a critical gap for {target_role}")
    if not request.projects:
        risks.append("No project proof added yet")
    if not request.experience:
        risks.append("No experience items tracked")
    if not request.resume_score:
        risks.append("Resume not yet scored")

    # Next actions
    actions = []
    if critical_gaps:
        actions.append(f"Start learning {critical_gaps[0].skill} — it's the biggest gap for {target_role}.")
    if not request.projects:
        actions.append(f"Add a project that demonstrates your {target_role} skills.")
    else:
        actions.append(f"Strengthen your \"{request.projects[0]}\" project with documentation and a live demo.")
    if not request.resume_score:
        actions.append("Upload your resume to get an ATS readiness score.")
    else:
        actions.append("Use the resume page to improve weak sections before applying.")
    actions.append(f"Apply to 3 beginner-friendly {target_role} opportunities this week.")

    # Build real courses from top gaps
    courses = []
    course_templates = [
        ("Google Career Certificates: {skill}", "Google", "Official Certification", "Free audit / Coursera",
         "https://grow.google/certificates/",
         "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"),
        ("Coursera: {skill} for {role}", "Coursera", "Online Course", "Free audit",
         "https://www.coursera.org/search?query={query}",
         "https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg"),
        ("Microsoft Learn: {skill}", "Microsoft Learn", "Official Path", "Free",
         "https://learn.microsoft.com/en-us/search/?terms={query}",
         "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"),
        ("freeCodeCamp: {skill}", "freeCodeCamp", "Free Course", "Free",
         "https://www.freecodecamp.org/news/search/?query={query}",
         None),
        ("Udemy: {skill} Masterclass", "Udemy", "Premium Course", "Paid",
         "https://www.udemy.com/courses/search/?src=ukw&q={query}",
         "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg"),
        ("edX: {skill} Professional Certificate", "edX", "Professional Certificate", "Free audit",
         "https://www.edx.org/search?q={query}",
         None),
    ]
    top_gap_skills = [g.skill for g in gaps[:3]]
    for skill in top_gap_skills:
        query = _slug(f"{skill} {target_role}")
        for title_t, provider, ctype, price, url_t, logo in course_templates[:2]:
            courses.append(ResourceItem(
                title=title_t.format(skill=skill, role=target_role),
                provider=provider, type=ctype, price=price,
                reason=f"Build proof for {skill} to close your gap",
                url=url_t.format(query=query), skill=skill, logo=logo
            ))
    # Fill remaining slots
    remaining_skills = [g.skill for g in gaps[3:]]
    for skill in remaining_skills[:3]:
        query = _slug(f"{skill} {target_role}")
        tmpl = course_templates[2]  # Microsoft Learn
        courses.append(ResourceItem(
            title=tmpl[0].format(skill=skill, role=target_role),
            provider=tmpl[1], type=tmpl[2], price=tmpl[3],
            reason=f"Close your {skill} gap with free official training",
            url=tmpl[4].format(query=query), skill=skill, logo=tmpl[5]
        ))

    # Build simulations
    query = _slug(target_role)
    simulations = [
        ResourceItem(
            title=f"{target_role} Virtual Job Simulation", provider="Forage",
            type="Virtual Internship", price="Free",
            reason="Practice real job tasks you can discuss in interviews",
            url=f"https://www.theforage.com/simulations?query={query}",
        ),
        ResourceItem(
            title=f"{target_role} Early Career Opportunities", provider="Forage",
            type="Early career roles", price="Free",
            reason="Find internships, events, and entry-level roles",
            url=f"https://www.theforage.com/jobs?query={query}",
        ),
        ResourceItem(
            title=f"{target_role} India Internships", provider="AICTE Internship Portal",
            type="Verified Internships", price="Free for students",
            reason="Official Indian government internship portal",
            url="https://internship.aicte-india.org/",
        ),
        ResourceItem(
            title=f"{target_role} SWAYAM Plus Internships", provider="SWAYAM Plus",
            type="Internship Catalog", price="Free",
            reason="Course-linked internship discovery",
            url="https://swayam-plus.swayam2.ac.in/internship",
        ),
    ]

    return DashboardAnalysisResponse(
        targetRole=target_role,
        readinessScore=readiness,
        resumeScore=request.resume_score,
        gaps=gaps,
        strongestSignals=strongest,
        riskSignals=risks,
        nextActions=actions,
        courses=courses,
        simulations=simulations,
    )


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
    
    # Build a smart local fallback from request data (used when AI is unavailable)
    local_fallback = _build_local_fallback(request)
    fallback_json = local_fallback.model_dump_json()

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
        # Instead of raising 503, return the local fallback with real data
        return local_fallback
        
    # Extra safety check: if targetRole still has the verbose prompt, clean it
    if "freelanc" in parsed.targetRole.lower():
        if "react" in "".join(request.profile_skills).lower() or "frontend" in parsed.targetRole.lower():
            parsed.targetRole = "Freelance Frontend Developer"
        else:
            parsed.targetRole = "Freelance Developer"
            
    return parsed
