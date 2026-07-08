"""
Adzuna service wrapper.
It calls the Adzuna India jobs endpoint and normalizes internship listings.
"""
import httpx

from config import get_settings
from models.schemas import InternshipItem


# Calls GET /v1/api/jobs/in/search/{page} and returns normalized internship items.
async def search_adzuna(query: str, location: str, page: int, page_size: int) -> list[InternshipItem]:
    settings = get_settings()
    if not settings.adzuna_app_id or not settings.adzuna_app_key:
        return []

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"https://api.adzuna.com/v1/api/jobs/in/search/{page}",
                params={
                    "app_id": settings.adzuna_app_id,
                    "app_key": settings.adzuna_app_key,
                    "what": query,
                    "where": location,
                    "results_per_page": page_size,
                    "content-type": "application/json",
                },
            )
            response.raise_for_status()
            results = response.json().get("results", [])
            return [
                InternshipItem(
                    source="Adzuna",
                    title=item.get("title", "Untitled role"),
                    company=item.get("company", {}).get("display_name", "Unknown company"),
                    location=item.get("location", {}).get("display_name", location),
                    url=item.get("redirect_url", "#"),
                    description=(item.get("description") or "")[:320],
                )
                for item in results
            ]
    except httpx.HTTPError:
        return []
