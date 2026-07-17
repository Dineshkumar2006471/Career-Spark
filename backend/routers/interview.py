"""
Mock interview API router.
It gives concise coaching feedback for Web Speech API transcripts.
"""
from fastapi import APIRouter
import logging

from models.schemas import InterviewFeedbackRequest, InterviewFeedbackResponse
from services.gemini_ai import complete_chat

logger = logging.getLogger("careerspark.api")

router = APIRouter(prefix="/interview", tags=["interview"])


# Calls Gemini AI for dynamic interview coaching and generates the next question.
@router.post("/feedback", response_model=InterviewFeedbackResponse)
async def interview_feedback(request: InterviewFeedbackRequest) -> InterviewFeedbackResponse:
    from models.schemas import StructuredFeedback

    fallback_feedback = StructuredFeedback(
        score=5,
        pros=["You attempted to answer the question."],
        cons=["Your answer lacked specific details and the STAR format."],
        example_answer="In my last role, we needed a new tool to handle X. I researched Y and Z, chose Y, and implemented it within a week, resulting in a 20% efficiency increase."
    )
    fallback_response = InterviewFeedbackResponse(
        feedback=fallback_feedback,
        next_question="Can you tell me about a time you faced a difficult technical challenge?"
    )
    
    # Build a context string from the user's profile
    skills_str = ", ".join(request.profile_skills) if request.profile_skills else "None specified"
    exp_str = " | ".join(request.experience) if request.experience else "None specified"
    proj_str = " | ".join(request.projects) if request.projects else "None specified"

    system_prompt = (
        f"You are an expert technical recruiter and interview coach for a {request.target_role} position.\n"
        "You are conducting a dynamic, rigorous mock interview. Act like a real recruiter who has read the candidate's profile.\n\n"
        f"CANDIDATE PROFILE:\n"
        f"- Target Role: {request.target_role}\n"
        f"- Skills: {skills_str}\n"
        f"- Experience: {exp_str}\n"
        f"- Projects: {proj_str}\n\n"
        "The user will provide their verbal response (transcript) to the current interview question (prompt).\n"
        "1. Provide highly specific, constructive feedback adhering EXACTLY to the JSON schema.\n"
        "2. 'score': rate the answer out of 10 based on clarity, impact, and STAR method.\n"
        "3. 'pros': Array of 1-3 short bullet points (max 2 sentences each) highlighting what went well.\n"
        "4. 'cons': Array of 1-3 short bullet points (max 2 sentences each) critically pointing out missing details or vague statements.\n"
        "5. 'example_answer': A concise, 1-paragraph STAR method response showing how to answer it perfectly, incorporating their specific skills/projects if possible.\n"
        "6. 'next_question': Generate a logical, realistic NEXT follow-up behavioral question testing attitude, decision-making, or problem-solving. Make it highly personalized to the technologies and projects in their profile."
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    
    for item in request.history:
        role = item.get("role")
        content = item.get("content")
        if role in ["user", "model"] and content:
            messages.append({"role": role, "content": content})
            
    messages.append({
        "role": "user", 
        "content": f"Interview Question: {request.prompt}\nUser's Answer (Transcript): {request.transcript}"
    })
    
    try:
        feedback_json_str = await complete_chat(
            messages=messages,
            fallback=fallback_response.model_dump_json(),
            response_schema=InterviewFeedbackResponse,
            temperature=0.7,
        )
        return InterviewFeedbackResponse.model_validate_json(feedback_json_str)
    except Exception as e:
        logger.error(f"Failed to parse dynamic interview feedback: {e}")
        return fallback_response
