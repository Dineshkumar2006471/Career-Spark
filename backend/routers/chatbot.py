"""
Chatbot API router.
It answers career questions with NVIDIA NIM when configured and a useful fallback otherwise.
"""
from fastapi import APIRouter

from models.schemas import ChatRequest, ChatResponse
from services.nvidia_nim import complete_chat

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


# Calls NVIDIA NIM chat completion with user context and returns an assistant answer.
@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(request: ChatRequest) -> ChatResponse:
    fallback = "Use your roadmap as the source of truth: pick one skill gap, finish one course module, and apply it in a small project before looking for internships."
    answer = await complete_chat(
        [
            {"role": "system", "content": "You are CareerSpark's concise career assistant for Indian Class-12-pass students."},
            {"role": "user", "content": f"Context: {request.context or 'No context'}\nQuestion: {request.message}"},
        ],
        fallback,
    )
    return ChatResponse(answer=answer)
