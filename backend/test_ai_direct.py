import asyncio
from services.gemini_ai import complete_chat

async def main():
    res = await complete_chat([{"role": "user", "content": "Hello"}], fallback="fallback")
    print("Result:", res)

if __name__ == "__main__":
    asyncio.run(main())
