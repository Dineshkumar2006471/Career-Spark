import asyncio
import json
from models.schemas import DashboardAnalysisRequest
from routers.analysis import generate_dashboard_analysis

async def run_test():
    req = DashboardAnalysisRequest(
        target_role="I want to start freelancing on my skills and experience, I need clear roadmap for that",
        profile_skills=["React", "Node.js"],
        projects=[],
        experience=[],
        resume_score=0,
        goal_note="I want to start freelancing"
    )
    res = await generate_dashboard_analysis(req)
    print("----- RESULT -----")
    print(res.model_dump_json(indent=2))

if __name__ == "__main__":
    asyncio.run(run_test())
