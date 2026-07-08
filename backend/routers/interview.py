"""
Mock interview API router.
It gives concise coaching feedback for Web Speech API transcripts.
"""
from fastapi import APIRouter

from models.schemas import InterviewFeedbackRequest, InterviewFeedbackResponse
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/interview", tags=["interview"])


# Calls Gemini AI for interview coaching and returns concise feedback.
@router.post("/feedback", response_model=InterviewFeedbackResponse)
async def interview_feedback(request: InterviewFeedbackRequest) -> InterviewFeedbackResponse:
    fallback = "Structure the answer as situation, action, result. Add one specific tool, one measurable outcome, and what you learned."
    feedback = await complete_chat(
        [
            {"role": "system", "content": (
                "You are an expert technical interview coach. "
                "Analyze the user's verbal response (transcript) to the given interview question (prompt). "
                "Provide highly specific, constructive feedback in bullet points. "
                "1. Highlight what they did well (e.g., communication, enthusiasm). "
                "2. Critically point out missing technical details, lack of STAR method structure, or vague statements. "
                "3. Suggest a concrete way to improve the answer next time. "
                "Speak directly to the candidate in a supportive but rigorous tone."
            )},
            {"role": "user", "content": f"Interview Question: {request.prompt}\nUser's Answer (Transcript): {request.transcript}"},
        ],
        fallback,
    )
    return InterviewFeedbackResponse(feedback=feedback)
