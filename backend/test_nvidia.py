import asyncio
from services.nvidia_nim import complete_chat
from config import get_settings

async def test():
    settings = get_settings()
    print("API KEY:", settings.nvidia_api_key)
    if not settings.nvidia_api_key:
        print("No API key.")
        return
    
    prompt = "Return exactly this JSON: {\"phases\": []}"
    messages = [{"role": "user", "content": prompt}]
    fallback = '{"phases": []}'
    
    res = await complete_chat(messages, fallback)
    print("RESPONSE:", res)

if __name__ == "__main__":
    asyncio.run(test())
