import urllib.request
import json

data = json.dumps({
    "career_path": "Frontend Development",
    "current_skills": [],
    "experience": [],
    "goal_note": "Target role: AI Engineer | I want to build AI models"
}).encode('utf-8')

req = urllib.request.Request("http://localhost:8000/roadmap/generate", data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print("Provider:", result.get("provider_status"))
        print("Phases count:", len(result.get("phases", [])))
        if len(result.get("phases", [])) > 0:
            print("Outcome 3:", result["phases"][2]["outcome"])
except Exception as e:
    print("Error:", e)
