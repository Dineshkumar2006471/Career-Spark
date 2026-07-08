"""
Google Gemini AI service wrapper.
It calls Google's Gemini API using the official google-genai SDK for roadmap, chatbot, resume, and coaching text.
"""
from google import genai
import asyncio
from google.api_core.exceptions import ResourceExhausted, TooManyRequests

from config import get_settings

MODEL_NAME = "gemini-2.5-flash"


# Initializes the Gemini client and returns it for reuse across requests.
def _get_client():
    settings = get_settings()
    if not settings.vertex_project_id:
        return None
    return genai.Client(vertexai=True, project=settings.vertex_project_id, location=settings.vertex_location)


# Calls Gemini generate_content with a prompt string and returns the generated text.
async def generate_text(prompt: str, fallback: str, temperature: float = 0.3) -> str:
    client = _get_client()
    if not client:
        return fallback

    max_retries = 3
    base_delay = 1
    
    for attempt in range(max_retries):
        try:
            # We must use async if possible, but the python SDK for genai isn't fully async yet in some configurations,
            # wait, vertex models.generate_content is synchronous blocking. We should ideally run it in a thread if it blocks,
            # but for now we just wrap it. Wait, the API client exposes `aio` for async.
            response = await client.aio.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={"temperature": temperature, "max_output_tokens": 4096},
            )
            return response.text or fallback
        except Exception as exc:
            # Check for 429 Resource Exhausted
            if "429" in str(exc) or "ResourceExhausted" in str(exc):
                if attempt < max_retries - 1:
                    await asyncio.sleep(base_delay * (2 ** attempt))
                    continue
            return f"{fallback} AI provider note: {exc}"
    return fallback


# Calls Gemini with a multi-turn chat messages list and returns the assistant text.
async def complete_chat(messages: list[dict[str, str]], fallback: str, tools: list | None = None, response_schema: type | None = None) -> str:
    client = _get_client()
    if not client:
        return fallback

    try:
        # Convert message dictionaries into google.genai types.types.Content format
        from google.genai import types
        formatted_contents = []
        system_instruction = None
        
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                system_instruction = content
            else:
                formatted_contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=content)]
                    )
                )

        config_params = {"temperature": 0.3, "max_output_tokens": 8192}
        if system_instruction:
            config_params["system_instruction"] = system_instruction
        if tools:
            config_params["tools"] = tools
        if response_schema:
            config_params["response_mime_type"] = "application/json"
            config_params["response_schema"] = response_schema
        else:
            config_params["response_mime_type"] = "text/plain"

        max_retries = 3
        base_delay = 1
        
        for attempt in range(max_retries):
            try:
                response = await client.aio.models.generate_content(
                    model=MODEL_NAME,
                    contents=formatted_contents,
                    config=types.GenerateContentConfig(**config_params),
                )
                return response.text or fallback
            except Exception as exc:
                if "429" in str(exc) or "ResourceExhausted" in str(exc) or "quota" in str(exc).lower():
                    if attempt < max_retries - 1:
                        await asyncio.sleep(base_delay * (2 ** attempt))
                        continue
                return f"{fallback} AI provider note: {exc}"
                
        return fallback
    except Exception as exc:
        return f"{fallback} AI provider note: {exc}"
