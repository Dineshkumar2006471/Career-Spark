"""
Coding profile API router.
It exposes cached GitHub, Codeforces, and LeetCode profile stats.
"""
from fastapi import APIRouter, HTTPException
import httpx

from models.schemas import CodingProfileResponse
from services.codeforces_api import fetch_codeforces_profile
from services.github_api import fetch_github_profile
from services.leetcode_api import fetch_leetcode_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])


# Calls the requested public profile API and returns normalized coding stats.
@router.get("/{provider}/{username}", response_model=CodingProfileResponse)
async def get_profile(provider: str, username: str) -> CodingProfileResponse:
    try:
        if provider == "github":
            return await fetch_github_profile(username)
        if provider == "codeforces":
            return await fetch_codeforces_profile(username)
        if provider == "leetcode":
            return await fetch_leetcode_profile(username)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"{provider} profile lookup failed. Check the username and try again.") from exc
    raise HTTPException(status_code=400, detail="Unsupported provider. Use github, codeforces, or leetcode.")
