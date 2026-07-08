"""
LeetCode GraphQL service wrapper.
It calls the public unofficial GraphQL endpoint and caches normalized stats.
"""
import httpx

from models.schemas import CodingProfileResponse
from services.cache import get_cache, set_cache


# Calls POST /graphql with matchedUser query and returns normalized stats.
async def fetch_leetcode_profile(username: str) -> CodingProfileResponse:
    cache_key = f"leetcode:{username}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    query = """
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats { acSubmissionNum { difficulty count } }
      }
    }
    """
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post("https://leetcode.com/graphql", json={"query": query, "variables": {"username": username}})
        response.raise_for_status()
        stats = response.json().get("data", {}).get("matchedUser", {}).get("submitStats", {}).get("acSubmissionNum", [])
        mapped = {item["difficulty"].lower(): item["count"] for item in stats}
        profile = CodingProfileResponse(provider="leetcode", username=username, stats=mapped)
        return set_cache(cache_key, profile)
