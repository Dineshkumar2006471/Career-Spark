# CareerSpark: Project Demo & Overview

Welcome to **CareerSpark**! This document provides a high-level overview of the platform, its key features, and the underlying AI architecture to help you explain the project to your mentor.

---

## 🎯 What is CareerSpark?

CareerSpark is an intelligent, AI-powered career development platform designed specifically for university students and early-career professionals. 

It bridges the gap between academic knowledge and industry expectations by analyzing a student's current skills, identifying critical knowledge gaps for their target role, and generating highly personalized, actionable roadmaps to get them hired.

**Who it helps:**
- **University Students:** Looking for internships or their first full-time role but unsure what specific skills industry recruiters demand.
- **Career Transitioners:** Individuals looking to pivot into a new technology role who need a structured, step-by-step path that doesn't waste time on fundamentals they already know.

---

## ✨ Key Features & How They Work

### 1. Smart Profile & Resume Analyzer
- **How it works:** Users upload their existing resume (PDF/DOCX) during onboarding. The platform extracts their skills, experience, and projects to automatically build their profile.
- **Value:** It scores the resume against ATS (Applicant Tracking System) standards and provides brutal, honest feedback on formatting, action verbs, and impact metrics.

### 2. AI Career Readiness Dashboard
- **How it works:** Once the profile is built, the AI engine evaluates the user's current profile against their specific target role (e.g., "AI Engineer" or "Frontend Developer").
- **Value:** It calculates a **Career Match Score** (a practical readiness estimate) and provides a prioritized list of the top gaps the user must fix immediately to become shortlist-ready.

### 3. Hyper-Personalized 90-Day Roadmap
- **How it works:** The AI analyzes the exact gaps between the user's current skills and the target role's requirements. It then generates a customized 3-month (12-week) action plan.
- **Value:** Unlike generic roadmaps, CareerSpark **only builds around the gaps**. It doesn't waste time teaching skills the student already knows. It provides concrete weekly actions, proof-of-work deliverables (like GitHub repos), and direct links to real-world courses (Coursera, Udemy, SWAYAM).

### 4. AI Mock Interviews & Coaching
- **How it works:** Students can engage in simulated technical and behavioral interviews directly on the platform.
- **Value:** The AI acts as a tough industry recruiter, asking role-specific questions and providing detailed feedback on the student's answers, helping them refine their communication before the real interview.

---

## 🧠 How the AI Engine Works

CareerSpark is not just a standard web app; it leverages a sophisticated AI pipeline to deliver its insights.

### The Architecture
- **Frontend:** Built with React and Vite, hosted globally on **Vercel** for lightning-fast performance.
- **Backend:** A robust **FastAPI (Python)** server, containerized and deployed on **Google Cloud Run** for scalable, serverless execution.
- **Database:** **Supabase** (PostgreSQL) is used for secure user authentication and persistent storage of roadmaps, profiles, and scores.
- **The Brain:** The platform is powered by **Google's Gemini 2.5 Flash** model, accessed securely via **Vertex AI**.

### The AI Reasoning Process
When a user requests a roadmap or dashboard analysis, the following sequence occurs:

1. **Context Gathering:** The FastAPI backend securely packages the user's entire profile (current skills, past internships, target role, education).
2. **Strict System Prompting:** The backend injects a rigorous "System Instruction" into Gemini. The AI is instructed to act as a top-tier Indian university career director. It is explicitly commanded to perform a **Gap Analysis** first—identifying what the student already knows and entirely stripping those out of the learning plan.
3. **Structured JSON Output:** The AI is forced to return its complex reasoning in strict JSON formats. This ensures that the generated roadmap isn't just a wall of text, but structured data (Months, Weeks, Skills, Courses, URLs) that the React frontend can render beautifully.
4. **Fallback Resilience:** If the AI is overwhelmed or rate-limited by high load, the backend gracefully degrades, returning a pre-built, structured fallback roadmap so the user experience is never broken. 

### Why Gemini 2.5 Flash?
We utilize Gemini 2.5 Flash because it offers the perfect balance of **low latency** and **high reasoning capability**. It processes the heavy context of a student's entire educational background in milliseconds, allowing CareerSpark to generate detailed, multi-month roadmaps in real-time.

---

*Built with passion to help students land their dream roles.*
