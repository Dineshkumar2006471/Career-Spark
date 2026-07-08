"""
Health response models for operational checks.
They keep even simple API responses typed and documented.
"""
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
