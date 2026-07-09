"""
Shared Pydantic schemas for CareerSpark feature APIs.
They keep request and response bodies explicit for frontend integration and mentor review.
"""
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    context: str | None = None
    history: list[dict] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str


class RoadmapRequest(BaseModel):
    career_path: str
    current_skills: list[str] = Field(default_factory=list)
    goal_note: str | None = None


class RoadmapResource(BaseModel):
    title: str
    provider: str
    url: str


class DetailedSkill(BaseModel):
    skill_name: str
    summary: str
    courses: list[RoadmapResource] = Field(default_factory=list)
    certifications: list[RoadmapResource] = Field(default_factory=list)


class StepByStepAction(BaseModel):
    timeframe: str
    action: str


class RoadmapPhase(BaseModel):
    title: str
    timeline: str
    outcome: str
    detailed_skills: list[DetailedSkill] = Field(default_factory=list)
    step_by_step_plan: list[StepByStepAction] = Field(default_factory=list)
    proof_outputs: list[str] = Field(default_factory=list)


class RoadmapResponse(BaseModel):
    career_path: str
    phases: list[RoadmapPhase]
    provider_status: str = "unknown"


class CareerPathMatch(BaseModel):
    id: str
    title: str
    match: int
    salary: str
    outlook: str
    summary: str


class AssessmentAnalyzeRequest(BaseModel):
    answers: dict[str, str]


class AssessmentAnalyzeResponse(BaseModel):
    results: list[CareerPathMatch]


class InternshipItem(BaseModel):
    source: str
    title: str
    company: str
    location: str
    url: str
    description: str


class PaginatedInternships(BaseModel):
    page: int
    page_size: int
    total: int
    items: list[InternshipItem]


class CodingProfileResponse(BaseModel):
    provider: str
    username: str
    stats: dict[str, str | int | float | None]


class ResumeAnalyzeRequest(BaseModel):
    text: str
    target_role: str


class ResumeAnalyzeResponse(BaseModel):
    score: int
    suggestions: list[str]
    extracted_text: str | None = None
    extracted_skills: list[str] = Field(default_factory=list)
    extracted_projects: list[str] = Field(default_factory=list)
    extracted_education: list[str] = Field(default_factory=list)
    extracted_experience: list[str] = Field(default_factory=list)
    profile_summary: str = ""


class InterviewFeedbackRequest(BaseModel):
    prompt: str
    transcript: str


class InterviewFeedbackResponse(BaseModel):
    feedback: str


class SkillGap(BaseModel):
    skill: str
    current: int
    target: int
    gap: int
    priority: str
    reason: str


class ResourceItem(BaseModel):
    title: str
    provider: str
    type: str
    price: str
    reason: str
    url: str
    skill: str | None = None
    logo: str | None = None


class DashboardAnalysisRequest(BaseModel):
    target_role: str
    profile_skills: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    resume_score: int | None = None
    goal_note: str | None = None
    location: str | None = None
    college: str | None = None
    degree: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None


class DashboardAnalysisResponse(BaseModel):
    targetRole: str
    readinessScore: int
    resumeScore: int | None = None
    gaps: list[SkillGap]
    strongestSignals: list[str]
    riskSignals: list[str]
    nextActions: list[str]
    courses: list[ResourceItem]
    simulations: list[ResourceItem]
