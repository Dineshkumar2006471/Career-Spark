"""
Job Recommendations API router.
Generates real-time, AI-matched job openings and placement drives across top tech companies
and startups (with remote, on-campus, off-campus, and hybrid work modes) using Gemini 2.5 Flash.
"""
import json
import logging
from fastapi import APIRouter, HTTPException

from models.schemas import JobRecommendationsRequest, JobRecommendationsResponse, JobRecommendationItem
from services.gemini_ai import generate_text

logger = logging.getLogger("careerspark.jobs")

router = APIRouter(prefix="/jobs", tags=["jobs"])

JOBS_PROMPT = """You are an expert technical recruiter and AI job matcher.
Generate a curated list of 10 real-world job openings, placement drives, and career opportunities tailored to this candidate:

<profile>
TARGET ROLE: {target_role}
SKILLS: {skills}
PROJECTS: {projects}
EXPERIENCE: {experience}
LOCATION PREFERENCE: {location}
RESUME ATS SCORE: {resume_score}
</profile>

<instructions>
Produce a JSON object with two keys:
1. "jobs": An array of exactly 10 job recommendation objects from real top tech companies (Infosys, TCS, Zoho, Accenture, IBM, Google, Microsoft, Amazon, Flipkart, Wipro, Cognizant, Freshworks, Razorpay, Swiggy, etc.) and startups.
For each job object, provide:
- "id": unique string like "job-1", "job-2", etc.
- "company": official company name (e.g., "Infosys", "TCS", "Zoho", "Accenture", "IBM", "Google", "Amazon", "Flipkart", "Freshworks")
- "domain": exact company web domain for logo retrieval (e.g., "infosys.com", "tcs.com", "zoho.com", "accenture.com", "ibm.com", "google.com", "amazon.in", "flipkart.com", "freshworks.com")
- "title": specific job role title matching the candidate's target role or skills (e.g., "Software Developer", "Python Developer", "Data Analyst", "Associate Systems Engineer", "AI Engineer")
- "location": Indian city or campus (e.g., "Bangalore", "Chennai", "Coimbatore", "Hyderabad", "Pune", "Our Campus", "Multiple Cities")
- "experience": required experience (e.g., "0-1 yrs", "0-2 yrs", "Fresher / Internship", "1-3 yrs")
- "salary": realistic Indian compensation string (e.g., "₹4.5 - 6.0 LPA", "₹5.0 - 8.0 LPA", "₹6.0 LPA", "₹8.0 - 12.0 LPA", "₹10 - 15 LPA")
- "work_mode": exactly one of these 5 options: "Remote", "On Campus", "Off Campus", "Virtual", "Hybrid". Ensure a diverse mix across the 10 jobs.
- "match_percentage": integer from 75 to 98 representing AI skill match confidence.
- "deadline": application deadline string (e.g., "10 Days Left", "17 Days Left", "25 Days Left", "05 Aug 2026", "Apply ASAP")
- "apply_url": search URL to apply (e.g., "https://www.google.com/search?q=infosys+careers+software+developer")
- "match_reason": 1 concise sentence explaining why this role fits the candidate's specific skills.

2. "recommended_reasons": A dictionary summarizing why these jobs were matched:
- "skills": A 1-sentence summary referencing the candidate's actual top skills (e.g., "High demand for your Python, React, and SQL proficiency across top IT firms.")
- "resume": A 1-sentence summary regarding their ATS profile readiness.
- "interests": A 1-sentence summary regarding their target role and location preferences.
</instructions>

<output_format>
Return ONLY valid JSON. No markdown fencing, no explanation, no extra text.
</output_format>
"""

FALLBACK_JOBS_JSON = {
    "jobs": [
        {
            "id": "job-1",
            "company": "Infosys",
            "domain": "infosys.com",
            "title": "Software Developer",
            "location": "Bangalore",
            "experience": "0-1 yrs",
            "salary": "₹4.5 - 6.0 LPA",
            "work_mode": "On Campus",
            "match_percentage": 94,
            "deadline": "10 Days Left",
            "apply_url": "https://www.infosys.com/careers.html",
            "match_reason": "Strong alignment with foundational programming and software engineering concepts."
        },
        {
            "id": "job-2",
            "company": "TCS",
            "domain": "tcs.com",
            "title": "Software Engineer",
            "location": "Chennai",
            "experience": "0-2 yrs",
            "salary": "₹4.0 - 7.0 LPA",
            "work_mode": "Off Campus",
            "match_percentage": 92,
            "deadline": "15 Days Left",
            "apply_url": "https://www.tcs.com/careers",
            "match_reason": "Matches core competencies required for TCS Digital and Ninja hiring tracks."
        },
        {
            "id": "job-3",
            "company": "Zoho",
            "domain": "zoho.com",
            "title": "Data Analyst / Developer",
            "location": "Chennai",
            "experience": "0-2 yrs",
            "salary": "₹5.0 - 8.0 LPA",
            "work_mode": "Hybrid",
            "match_percentage": 90,
            "deadline": "12 Days Left",
            "apply_url": "https://www.zoho.com/careers/",
            "match_reason": "High match for problem-solving aptitude and full-stack development skills."
        },
        {
            "id": "job-4",
            "company": "Accenture",
            "domain": "accenture.com",
            "title": "Associate App Developer",
            "location": "Hyderabad",
            "experience": "Fresher",
            "salary": "₹4.5 - 6.5 LPA",
            "work_mode": "Virtual",
            "match_percentage": 89,
            "deadline": "17 Days Left",
            "apply_url": "https://www.accenture.com/in-en/careers",
            "match_reason": "Ideal entry-level opportunity utilizing modern application development frameworks."
        },
        {
            "id": "job-5",
            "company": "IBM",
            "domain": "ibm.com",
            "title": "Associate Systems Engineer",
            "location": "Coimbatore",
            "experience": "0-1 yrs",
            "salary": "₹5.5 - 7.5 LPA",
            "work_mode": "On Campus",
            "match_percentage": 88,
            "deadline": "25 Days Left",
            "apply_url": "https://www.ibm.com/careers",
            "match_reason": "Great fit for enterprise systems engineering and cloud computing foundations."
        },
        {
            "id": "job-6",
            "company": "Google",
            "domain": "google.com",
            "title": "Software Engineering Intern",
            "location": "Bangalore",
            "experience": "Internship",
            "salary": "₹65,000 / month",
            "work_mode": "Hybrid",
            "match_percentage": 91,
            "deadline": "Apply ASAP",
            "apply_url": "https://careers.google.com/",
            "match_reason": "Exceptional growth opportunity matching your data structures and coding projects."
        },
        {
            "id": "job-7",
            "company": "Amazon",
            "domain": "amazon.in",
            "title": "SDE-1 (Early Career)",
            "location": "Bangalore",
            "experience": "0-1 yrs",
            "salary": "₹12.0 - 18.0 LPA",
            "work_mode": "Hybrid",
            "match_percentage": 86,
            "deadline": "20 Days Left",
            "apply_url": "https://www.amazon.jobs/en/",
            "match_reason": "High reward role suited for candidates with demonstrated algorithmic logic."
        },
        {
            "id": "job-8",
            "company": "Freshworks",
            "domain": "freshworks.com",
            "title": "Product Developer",
            "location": "Chennai",
            "experience": "0-2 yrs",
            "salary": "₹7.0 - 10.0 LPA",
            "work_mode": "Remote",
            "match_percentage": 87,
            "deadline": "14 Days Left",
            "apply_url": "https://www.freshworks.com/company/careers/",
            "match_reason": "Aligns with agile product building and modern frontend/backend tech stack."
        },
        {
            "id": "job-9",
            "company": "Cognizant",
            "domain": "cognizant.com",
            "title": "GenC Next Developer",
            "location": "Pune",
            "experience": "Fresher",
            "salary": "₹4.0 - 6.75 LPA",
            "work_mode": "Off Campus",
            "match_percentage": 85,
            "deadline": "08 Aug 2026",
            "apply_url": "https://careers.cognizant.com/",
            "match_reason": "Matches enterprise digital transformation and full-stack engineering requirements."
        },
        {
            "id": "job-10",
            "company": "Razorpay",
            "domain": "razorpay.com",
            "title": "Backend Developer Intern",
            "location": "Bangalore",
            "experience": "0-1 yrs",
            "salary": "₹50,000 / month",
            "work_mode": "Remote",
            "match_percentage": 93,
            "deadline": "5 Days Left",
            "apply_url": "https://razorpay.com/jobs/",
            "match_reason": "High compatibility for API integration and scalable system architecture skills."
        }
    ],
    "recommended_reasons": {
        "skills": "Strong match with Python, React, and SQL requirements across leading IT firms and tech product startups.",
        "resume": "Your ATS profile demonstrates clear academic credentials and project evidence.",
        "interests": "Highly aligned with software development roles and flexible work mode preferences."
    }
}


@router.post("/recommend", response_model=JobRecommendationsResponse)
async def recommend_jobs(request: JobRecommendationsRequest) -> JobRecommendationsResponse:
    target_role = request.target_role or "Software Developer"
    skills_str = ", ".join(request.profile_skills) if request.profile_skills else "Python, HTML/CSS, JavaScript, SQL, React"
    projects_str = ", ".join(request.projects) if request.projects else "Full Stack Web Application, Student Dashboard"
    experience_str = ", ".join(request.experience) if request.experience else "Fresher / Seeking entry level opportunities"
    location_str = request.location or "Bangalore / Chennai / Hybrid / Remote"
    resume_score_str = str(request.resume_score) if request.resume_score else "75/100"

    prompt = JOBS_PROMPT.format(
        target_role=target_role,
        skills=skills_str,
        projects=projects_str,
        experience=experience_str,
        location=location_str,
        resume_score=resume_score_str,
    )

    try:
        raw_text = await generate_text(prompt)
        if not raw_text:
            logger.warning("Gemini returned empty response for job recommendations, using fallback.")
            return JobRecommendationsResponse(**FALLBACK_JOBS_JSON)

        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        data = json.loads(cleaned)
        return JobRecommendationsResponse(**data)
    except Exception as e:
        logger.warning(f"Error parsing Gemini job recommendations: {e}. Using fallback.")
        return JobRecommendationsResponse(**FALLBACK_JOBS_JSON)
