"""
Google Gemini AI service wrapper.
It calls Google's Gemini API using the official google-genai SDK for roadmap, chatbot, resume, and coaching text.
Uses Vertex AI for enterprise-grade authentication on Cloud Run.
"""
from google import genai
from google.genai import types
import asyncio
import logging

from config import get_settings

logger = logging.getLogger("careerspark.ai")

MODEL_NAME = "gemini-2.5-flash"


# Initializes the Gemini client and returns it for reuse across requests.
def _get_client():
    settings = get_settings()
    if not settings.vertex_project_id:
        logger.warning("VERTEX_PROJECT_ID not set — AI client will not initialize.")
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
            response = await client.aio.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=4096,
                ),
            )
            return response.text or fallback
        except Exception as exc:
            # Check for 429 Resource Exhausted
            if "429" in str(exc) or "ResourceExhausted" in str(exc):
                if attempt < max_retries - 1:
                    await asyncio.sleep(base_delay * (2 ** attempt))
                    continue
            logger.error(f"Gemini generate_text error (attempt {attempt + 1}): {exc}")
            return fallback
    return fallback


# Calls Gemini with a multi-turn chat messages list and returns the assistant text.
# Supports a dedicated system_instruction for persona definition (Google best practice).
async def complete_chat(
    messages: list[dict[str, str]],
    fallback: str,
    tools: list | None = None,
    response_schema: type | None = None,
    system_instruction: str | None = None,
    temperature: float = 0.3,
) -> str:
    client = _get_client()
    if not client:
        return fallback

    try:
        formatted_contents = []
        extracted_system = system_instruction  # Prefer explicit param

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                # If system_instruction wasn't passed explicitly, extract from messages
                if not extracted_system:
                    extracted_system = content
            else:
                formatted_contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=content)]
                    )
                )

        config_params = {
            "temperature": temperature,
            "max_output_tokens": 8192,
        }
        
        # System instruction is a top-level config parameter in the SDK
        if extracted_system:
            config_params["system_instruction"] = extracted_system
        
        if tools:
            config_params["tools"] = tools
        if response_schema:
            config_params["response_mime_type"] = "application/json"
            config_params["response_schema"] = response_schema
        else:
            config_params["response_mime_type"] = "text/plain"

        max_retries = 3
        base_delay = 1.5
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Gemini request (attempt {attempt + 1}): model={MODEL_NAME}, system_len={len(extracted_system or '')}, content_parts={len(formatted_contents)}")
                response = await client.aio.models.generate_content(
                    model=MODEL_NAME,
                    contents=formatted_contents,
                    config=types.GenerateContentConfig(**config_params),
                )
                result = response.text or fallback
                logger.info(f"Gemini response: {len(result)} chars")
                return result
            except Exception as exc:
                if "429" in str(exc) or "ResourceExhausted" in str(exc) or "quota" in str(exc).lower():
                    if attempt < max_retries - 1:
                        wait = base_delay * (2 ** attempt)
                        logger.warning(f"Rate limited (attempt {attempt + 1}), retrying in {wait}s...")
                        await asyncio.sleep(wait)
                        continue
                logger.error(f"Gemini complete_chat error (attempt {attempt + 1}): {exc}")
                return fallback
                
        return fallback
    except Exception as exc:
        logger.error(f"Gemini complete_chat outer error: {exc}")
        return fallback
