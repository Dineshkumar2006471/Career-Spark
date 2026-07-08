"""
Chatbot API router.
It answers career questions with NVIDIA NIM when configured and a useful fallback otherwise.
"""
from fastapi import APIRouter

from models.schemas import ChatRequest, ChatResponse
from services.gemini_ai import complete_chat

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


# Calls NVIDIA NIM chat completion with user context and returns an assistant answer.
@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(request: ChatRequest) -> ChatResponse:
    fallback = "Use your roadmap as the source of truth: pick one skill gap, finish one course module, and apply it in a small project before looking for internships."
    messages = [
        {"role": "system", "content": (
            "You are CareerSpark's conversational AI career coach for students. "
            "You will be provided with the user's background context and their current question. "
            "CRITICAL INSTRUCTIONS: "
            "1. ALWAYS respond directly and conversationally to the user's specific question. "
            "2. If the user greets you (e.g. 'Hi'), greet them back warmly and ask how you can help. "
            "3. NEVER dump a generic summary of their profile unless they explicitly ask for an overview. "
            "4. Use the provided context ONLY to inform and personalize your answers. "
            "5. Keep your answers concise, friendly, and highly relevant to the question asked."
        )}
    ]
    
    for h in request.history:
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        
    messages.append({"role": "user", "content": f"Context: {request.context or 'No context'}\n\nQuestion: {request.message}"})

    answer = await complete_chat(messages, fallback)
    return ChatResponse(answer=answer)
