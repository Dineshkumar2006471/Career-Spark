"""
NVIDIA NIM service wrapper.
It calls NVIDIA's OpenAI-compatible chat completions endpoint for roadmap and coaching text.
"""
import httpx

from config import get_settings

NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL_NAME = "meta/llama-3.1-70b-instruct"
DEFAULT_TIMEOUT_SECONDS = 20


# Calls POST /v1/chat/completions with chat messages and returns the assistant text.
async def complete_chat(messages: list[dict[str, str]], fallback: str) -> str:
    settings = get_settings()
    if not settings.nvidia_api_key:
        return fallback

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT_SECONDS) as client:
            response = await client.post(
                NVIDIA_CHAT_URL,
                headers={"Authorization": f"Bearer {settings.nvidia_api_key}", "Content-Type": "application/json"},
                json={"model": MODEL_NAME, "messages": messages, "temperature": 0.3, "max_tokens": 2400},
            )
            response.raise_for_status()
            payload = response.json()
            return payload["choices"][0]["message"]["content"]
    except (httpx.HTTPError, KeyError, IndexError) as exc:
        return f"{fallback} AI provider note: {exc}"
