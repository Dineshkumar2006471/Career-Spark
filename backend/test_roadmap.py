import asyncio
import json
from services.gemini_ai import complete_chat
from routers.roadmap import ROADMAP_SYSTEM_INSTRUCTION

async def test_roadmap():
    fallback = '{"phases": []}'
    prompt = """Generate a highly detailed, personalized 3-month career roadmap.

<student_profile>
GENERIC CAREER PATH CATEGORY: AI Engineer
SPECIFIC TARGET ROLE & GOAL: AI Engineer
CURRENT SKILLS THE STUDENT ALREADY HAS: Python
PAST EXPERIENCE & INTERNSHIPS: NONE
</student_profile>

<gap_analysis_instructions>
BEFORE building the roadmap, you MUST:
1. Identify the EXACT target role from the "SPECIFIC TARGET ROLE & GOAL" field. If they provided a specific role (e.g., "Frontend Intern", "React Developer", "AI Engineer"), you MUST build the roadmap for THAT exact role, NOT the generic career path category.
2. List the top 10 skills required for their SPECIFIC target role.
3. Check which of those skills the student ALREADY has from their current_skills AND their PAST EXPERIENCE.
4. Identify the GAPS — skills and practical experience the student is MISSING for their specific role.
5. Build the roadmap ONLY around the gaps. Do NOT teach skills the student already knows or repeat past internships.
6. If the student already has experience in an area, suggest advanced polish or skipping fundamentals entirely.
</gap_analysis_instructions>

<roadmap_rules>
- Create exactly 3 phases (Month 1, Month 2, Month 3).
- Each phase MUST include:
  - `title`: e.g., "Month 1: Core Python & Data Fundamentals"
  - `timeline`: e.g., "Weeks 1-4"
  - `outcome`: What the student can prove after this phase.
  - `detailed_skills`: Array of skill objects. Each skill object has:
    - `skill_name`: The exact skill (e.g., "TensorFlow", not "ML framework")
    - `summary`: 1-2 sentences explaining what to learn and why
    - `courses`: Array of real courses with `title`, `provider`, and working `url`
    - `certifications`: Array of relevant certifications with `title`, `provider`, and `url`
  - `step_by_step_plan`: Array of weekly actions with `timeframe` and `action`
  - `proof_outputs`: Array of tangible deliverables the student creates

- CRITICAL: Use REAL course URLs. Examples:
  - https://www.coursera.org/search?query=Deep+Learning
  - https://swayam.gov.in/explorer?searchText=Python
  - https://www.udemy.com/courses/search/?q=React
  - https://www.freecodecamp.org/learn/
  - https://learn.microsoft.com/en-us/training/browse/?terms=Azure
  
- CRITICAL: Be SPECIFIC about technologies. Never say "learn fundamentals" — say "Learn Python pandas for data manipulation, focus on DataFrame operations, groupby, and merge."
</roadmap_rules>

Return ONLY valid JSON with a top-level key "phases" containing the array of phase objects."""

    res = await complete_chat([{"role": "user", "content": prompt}], fallback, system_instruction=ROADMAP_SYSTEM_INSTRUCTION)
    print("RESPONSE LENGTH:", len(res))
    print("FIRST 100:", res[:100])
    print("LAST 100:", res[-100:])
    import re
    match = re.search(r"\{.*\}", res, re.DOTALL)
    if not match:
        print("NO MATCH")
    else:
        try:
            payload = json.loads(match.group(0))
            print("SUCCESS! Phases count:", len(payload.get("phases", [])))
        except Exception as e:
            print("JSON ERROR:", e)
            print("EXTRACTED JSON:", match.group(0)[:500])

if __name__ == "__main__":
    asyncio.run(test_roadmap())
