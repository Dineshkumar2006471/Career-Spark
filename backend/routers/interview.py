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
    fallback_response = InterviewFeedbackResponse(
        feedback="Structure the answer as situation, action, result. Add one specific tool, one measurable outcome, and what you learned.",
        next_question="Can you tell me about a time you faced a difficult technical challenge?"
    )
    
    system_prompt = (
        f"You are an expert technical interview coach for a {request.target_role} position. "
        "You are conducting a dynamic mock interview. "
        "The user will provide their verbal response (transcript) to the current interview question (prompt). "
        "1. Provide highly specific, constructive feedback in bullet points on their current answer. "
        "2. Critically point out missing technical details, lack of STAR method structure, or vague statements. "
        "3. Generate a logical, realistic NEXT follow-up question based on their answer and target role. If they gave a shallow answer, probe deeper. "
        "Speak directly to the candidate in a supportive but rigorous tone."
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
