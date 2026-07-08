"""
Codeforces service wrapper.
It calls the public Codeforces API and caches normalized competitive profile stats.
"""
import httpx

from models.schemas import CodingProfileResponse
from services.cache import get_cache, set_cache


# Calls GET /api/user.info and /api/user.status and returns normalized stats.
async def fetch_codeforces_profile(username: str) -> CodingProfileResponse:
    cache_key = f"codeforces:{username}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=20) as client:
      user_response = await client.get("https://codeforces.com/api/user.info", params={"handles": username})
      user_response.raise_for_status()
      status_response = await client.get("https://codeforces.com/api/user.status", params={"handle": username, "from": 1, "count": 1000})
      status_response.raise_for_status()
      user = user_response.json()["result"][0]
      solved = {item.get("problem", {}).get("name") for item in status_response.json().get("result", []) if item.get("verdict") == "OK"}
      profile = CodingProfileResponse(
          provider="codeforces",
          username=username,
          stats={"rating": user.get("rating"), "max_rating": user.get("maxRating"), "solved_count": len(solved)},
      )
      return set_cache(cache_key, profile)
