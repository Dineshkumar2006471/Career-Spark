"""
Backend configuration for CareerSpark.
Environment values stay centralized so API keys are never hardcoded in routers or services.
"""
import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    vertex_project_id: str | None
    vertex_location: str | None
    supabase_url: str | None
    supabase_service_key: str | None
    adzuna_app_id: str | None
    adzuna_app_key: str | None
    github_token: str | None


# Loads backend environment variables and returns immutable settings for services.
def get_settings() -> Settings:
    return Settings(
        vertex_project_id=os.getenv("VERTEX_PROJECT_ID"),  # GCP Project ID for Vertex AI.
        vertex_location=os.getenv("VERTEX_LOCATION"),      # GCP Location for Vertex AI (e.g. us-central1).
        supabase_url=os.getenv("SUPABASE_URL"),  # Supabase project URL for server-side database access.
        supabase_service_key=os.getenv("SUPABASE_SERVICE_KEY"),  # Supabase service role key for trusted backend-only operations.
        adzuna_app_id=os.getenv("ADZUNA_APP_ID"),  # Adzuna application ID for internship search requests.
        adzuna_app_key=os.getenv("ADZUNA_APP_KEY"),  # Adzuna API key for authenticated internship search requests.
        github_token=os.getenv("GITHUB_TOKEN"),  # Optional GitHub token for higher public API rate limits.
    )
