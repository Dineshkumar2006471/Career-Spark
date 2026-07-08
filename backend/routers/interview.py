"""
Mock interview API router.
It gives concise coaching feedback for Web Speech API transcripts.
"""
from fastapi import APIRouter

from models.schemas import InterviewFeedbackRequest, InterviewFeedbackResponse
from services.nvidia_nim import complete_chat

router = APIRouter(prefix="/interview", tags=["interview"])


# Calls NVIDIA NIM for interview coaching and returns concise feedback.
@router.post("/feedback", response_model=InterviewFeedbackResponse)
async def interview_feedback(request: InterviewFeedbackRequest) -> InterviewFeedbackResponse:
    fallback = "Structure the answer as situation, action, result. Add one specific tool, one measurable outcome, and what you learned."
    feedback = await complete_chat(
        [
            {"role": "system", "content": "You are a practical interview coach for early-career Indian students."},
            {"role": "user", "content": f"Prompt: {request.prompt}\nTranscript: {request.transcript}\nGive concise feedback."},
        ],
        fallback,
    )
    return InterviewFeedbackResponse(feedback=feedback)
