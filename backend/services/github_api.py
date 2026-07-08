"""
GitHub REST service wrapper.
It calls public GitHub endpoints and caches normalized coding profile stats.
"""
import httpx

from config import get_settings
from models.schemas import CodingProfileResponse
from services.cache import get_cache, set_cache


# Calls GET /users/{username} and /users/{username}/repos and returns normalized stats.
async def fetch_github_profile(username: str) -> CodingProfileResponse:
    cache_key = f"github:{username}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    settings = get_settings()
    headers = {"Accept": "application/vnd.github+json"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    async with httpx.AsyncClient(timeout=20, headers=headers) as client:
        user_response = await client.get(f"https://api.github.com/users/{username}")
        user_response.raise_for_status()
        repos_response = await client.get(f"https://api.github.com/users/{username}/repos", params={"per_page": 100, "sort": "updated"})
        repos_response.raise_for_status()
        user = user_response.json()
        repos = repos_response.json()
        languages = sorted({repo.get("language") for repo in repos if repo.get("language")})
        profile = CodingProfileResponse(
            provider="github",
            username=username,
            stats={
                "public_repos": user.get("public_repos", 0),
                "followers": user.get("followers", 0),
                "top_languages": ", ".join(languages[:5]) or "Not available",
            },
        )
        return set_cache(cache_key, profile)
