"""
FastAPI entry point for the CareerSpark backend.
It wires health checks and feature routers while keeping each domain module explainable.
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.health import HealthResponse
from routers import assessment, chatbot, internships, interview, profiles, resume, roadmap

frontend_origins = os.getenv("FRONTEND_ORIGINS", os.getenv("FRONTEND_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173"))
allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

# App metadata explains the API in generated OpenAPI docs.
app = FastAPI(
    title="CareerSpark API",
    description="Backend API for CareerSpark career intelligence workflows.",
    version="0.1.0",
)

# CORS allows the React frontend to call the API without exposing backend secrets.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Feature routers are mounted early so each phase can add endpoints in its own module.
app.include_router(assessment.router)
app.include_router(roadmap.router)
app.include_router(chatbot.router)
app.include_router(internships.router)
app.include_router(profiles.router)
app.include_router(resume.router)
app.include_router(interview.router)


# Returns a lightweight health payload for local checks and Render health probes.
@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service="careerspark-api")
