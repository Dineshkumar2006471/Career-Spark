"""
Internship API router.
It merges Adzuna and Remotive results with explicit pagination.
"""
from fastapi import APIRouter, Query

from models.schemas import PaginatedInternships
from services.adzuna import search_adzuna
from services.remotive import search_remotive

router = APIRouter(prefix="/internships", tags=["internships"])


# Calls Adzuna and Remotive search endpoints and returns paginated normalized listings.
@router.get("/search", response_model=PaginatedInternships)
async def search_internships(
    query: str = Query("frontend intern"),
    location: str = Query("India"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=25),
) -> PaginatedInternships:
    adzuna_items = await search_adzuna(query, location, page, page_size)
    remotive_items = await search_remotive(query, page_size)
    combined = (adzuna_items + remotive_items)[:page_size]
    return PaginatedInternships(page=page, page_size=page_size, total=len(combined), items=combined)
