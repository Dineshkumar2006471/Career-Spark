"""
Shared Pydantic schemas for CareerSpark feature APIs.
They keep request and response bodies explicit for frontend integration and mentor review.
"""
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    context: str | None = None


class ChatResponse(BaseModel):
    answer: str


class RoadmapRequest(BaseModel):
    career_path: str
    current_skills: list[str] = Field(default_factory=list)
    goal_note: str | None = None


class RoadmapPhase(BaseModel):
    title: str
    timeline: str
    skills: list[str]
    outcome: str
    focus_areas: list[str] = Field(default_factory=list)
    courses: list[dict[str, str]] = Field(default_factory=list)
    certifications: list[dict[str, str]] = Field(default_factory=list)
    internships: list[dict[str, str]] = Field(default_factory=list)
    weekly_actions: list[str] = Field(default_factory=list)
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


class InterviewFeedbackRequest(BaseModel):
    prompt: str
    transcript: str


class InterviewFeedbackResponse(BaseModel):
    feedback: str
