"""
Remotive service wrapper.
It calls the public Remotive jobs API and normalizes remote listings.
"""
import httpx

from models.schemas import InternshipItem


# Calls GET /api/remote-jobs with search params and returns normalized internship items.
async def search_remotive(query: str, page_size: int) -> list[InternshipItem]:
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get("https://remotive.com/api/remote-jobs", params={"search": query})
            response.raise_for_status()
            jobs = response.json().get("jobs", [])[:page_size]
            return [
                InternshipItem(
                    source="Remotive",
                    title=item.get("title", "Untitled role"),
                    company=item.get("company_name", "Unknown company"),
                    location=item.get("candidate_required_location", "Remote"),
                    url=item.get("url", "#"),
                    description=(item.get("description") or "").replace("<p>", "").replace("</p>", "")[:320],
                )
                for item in jobs
            ]
    except httpx.HTTPError:
        return []
