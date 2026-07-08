# CareerSpark 🚀
### AI-Powered Career Intelligence Platform
> Built as part of Infosys Springboard Virtual Internship 7.0 — Batch 1

---

## What This Is

CareerSpark is a SaaS-style career intelligence platform built for students who just finished Class 12 and have no idea where to start. It asks them questions, figures out what they're good at and interested in, and gives them a clear career path with skills, certifications, courses, internships, and a downloadable roadmap. An AI chatbot is always available to answer their doubts.

This is not a static website. It is a full-stack, AI-powered web application with real data, real authentication, and real intelligence.

---

## The Problem It Solves

A student finishes Class 12. They don't know:
- Which career field suits them
- What skills they need to learn
- Which certifications actually matter
- Where to find real internships at their level
- What their profile looks like to recruiters

CareerSpark answers all of this in one place.

---

## Core Features

### 1. Career Assessment Engine
- Multi-step questionnaire (interests, strengths, subjects, working style)
- AI analyzes answers and maps the student to 1-3 career paths
- Each path shows: role name, what the work looks like, average salary, growth outlook

### 2. AI-Generated Roadmap
- Personalized step-by-step roadmap for the chosen career path
- Broken into phases: Foundation → Intermediate → Job-Ready
- Each phase includes: skills to learn, tools to master, estimated timeline
- Powered by NVIDIA NIM (Llama 3.1 70B) — free tier

### 3. Skill Gap Analyzer
- Student inputs their current skills
- Platform compares against target role requirements
- Shows exactly what's missing and in what priority order

### 4. Certifications Tracker
- Suggests official, recognized certifications for the target role
- Examples: Google Certificates, AWS Cloud Practitioner, Meta Frontend, Microsoft Learn
- All free or low-cost options prioritized
- Student can mark certifications as in-progress or completed

### 5. Course Recommendations
- Suggests real courses from platforms like Coursera, NPTEL, freeCodeCamp
- Mapped to the specific skill gaps identified
- Filtered by: free first, then paid options

### 6. Internship Discovery
- Real-time internship listings via Adzuna API (free tier) and Remotive API (free)
- Filtered by role, location (India-focused), and experience level (fresher/beginner)
- No mock data, no static listings

### 7. Roadmap PDF Download
- Student can download their full personalized roadmap as a PDF
- Includes: career path, phases, skills, certifications, courses, timeline
- Generated client-side using jsPDF (no server cost)

### 8. AI Chatbot Assistant
- Powered by NVIDIA NIM (Llama 3.1 70B)
- Context-aware: knows the student's chosen career path and roadmap
- Answers questions like: "Is data science right for me?", "How long does it take to learn Python?"
- Floating chat widget available on all dashboard pages

### 9. Profile Integration (GitHub + Codeforces)
- GitHub: pulls public repos, contribution graph, top languages via GitHub REST API (free)
- Codeforces: pulls rating, solved count, contest history via official Codeforces API (free, public)
- LeetCode: pulls stats via unofficial GraphQL endpoint (no auth required)
- Profile data feeds into the skill gap analysis

### 10. Dashboard
- Left sidebar navigation
- Top navbar with CareerSpark logo + user avatar + logout
- Cards showing: career match score, roadmap progress, skills completed, certifications earned
- Clean, modern SaaS UI

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast setup, component-based, great ecosystem |
| Styling | Tailwind CSS | Utility-first, fast to build clean UI |
| Routing | React Router v6 | Client-side routing for SaaS dashboard |
| Backend | Python FastAPI | Fast, async, perfect for AI API calls |
| Database | Supabase (PostgreSQL) | Free tier, handles auth + data |
| Authentication | Supabase Auth | Email/password + Google OAuth |
| AI Model | NVIDIA NIM — Llama 3.1 70B | Free tier, OpenAI-compatible SDK |
| PDF Generation | jsPDF + html2canvas | Client-side, no cost |
| Job APIs | Adzuna API + Remotive API | Free, real listings |
| Coding Profiles | GitHub API + Codeforces API + LeetCode GraphQL | All free/public |
| Frontend Deploy | Vercel | Free tier, instant from GitHub |
| Backend Deploy | Render | Free tier, connects to GitHub |
| Version Control | GitHub | Repo name: careerspark |

---

## Application Pages / Screens

### Public (No Login Required)
1. **Landing Page** (`/`) — SaaS-style hero, features, CTA button, top-right Login button
2. **Login Page** (`/login`) — Email/password + Google OAuth via Supabase
3. **Register Page** (`/register`) — Name, email, password, basic info

### Onboarding (After First Login)
4. **Career Assessment** (`/onboarding/assessment`) — Multi-step questionnaire
5. **Results Page** (`/onboarding/results`) — Career path suggestions with match scores
6. **Path Selection** (`/onboarding/choose`) — Student picks their primary career path

### Dashboard (After Onboarding)
7. **Dashboard Home** (`/dashboard`) — Overview cards, progress summary, quick actions
8. **My Roadmap** (`/dashboard/roadmap`) — Full AI-generated roadmap with phase breakdown
9. **Skill Gap Analyzer** (`/dashboard/skills`) — Current vs required skills, gap visualization
10. **Certifications** (`/dashboard/certifications`) — Recommended certs, progress tracking
11. **Courses** (`/dashboard/courses`) — Filtered course recommendations
12. **Internships** (`/dashboard/internships`) — Real-time listings from Adzuna + Remotive
13. **My Profile** (`/dashboard/profile`) — GitHub, Codeforces, LeetCode integration
14. **Download Roadmap** — PDF export button available on roadmap page
15. **AI Chatbot** — Floating widget on all dashboard pages

---

## Folder Structure

```
careerspark/
├── frontend/                  # React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Images, icons, logo
│   │   ├── components/        # Reusable UI components
│   │   │   ├── layout/        # Sidebar, Navbar, PageWrapper
│   │   │   ├── ui/            # Buttons, Cards, Badges, Inputs
│   │   │   └── chatbot/       # AI chat widget
│   │   ├── pages/             # One file per route/screen
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── onboarding/
│   │   │   │   ├── Assessment.jsx
│   │   │   │   ├── Results.jsx
│   │   │   │   └── ChoosePath.jsx
│   │   │   └── dashboard/
│   │   │       ├── Home.jsx
│   │   │       ├── Roadmap.jsx
│   │   │       ├── Skills.jsx
│   │   │       ├── Certifications.jsx
│   │   │       ├── Courses.jsx
│   │   │       ├── Internships.jsx
│   │   │       └── Profile.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # Auth context, User context
│   │   ├── services/          # API call functions (backend + external)
│   │   ├── utils/             # Helper functions, PDF generator
│   │   ├── App.jsx            # Root component + routing
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                   # Python FastAPI application
│   ├── main.py                # FastAPI app entry point
│   ├── routers/               # Route handlers
│   │   ├── assessment.py      # Career assessment endpoints
│   │   ├── roadmap.py         # AI roadmap generation
│   │   ├── chatbot.py         # AI chatbot endpoint
│   │   ├── internships.py     # Adzuna + Remotive API calls
│   │   └── profiles.py        # GitHub, Codeforces, LeetCode
│   ├── services/              # Business logic
│   │   ├── nvidia_nim.py      # NVIDIA NIM API wrapper
│   │   ├── adzuna.py          # Adzuna job API
│   │   ├── github_api.py      # GitHub REST API
│   │   └── codeforces_api.py  # Codeforces public API
│   ├── models/                # Pydantic data models
│   ├── config.py              # Environment variables
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Environment variable template
│
├── .gitignore
├── README.md
└── PROJECT.md                 # This file
```

---

## Environment Variables

### Frontend (`frontend/.env`)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=https://careerspark-api.onrender.com
```

### Backend (`backend/.env`)
```
NVIDIA_API_KEY=your_nvidia_nim_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_api_key
GITHUB_TOKEN=optional_for_higher_rate_limits
```

---

## API Integrations

| API | Purpose | Auth Type | Cost |
|---|---|---|---|
| NVIDIA NIM (Llama 3.1 70B) | Roadmap generation + Chatbot | API Key (free) | Free |
| Supabase | Auth + Database | Project keys | Free tier |
| Adzuna API | Real internship/job listings | App ID + Key (free) | Free |
| Remotive API | Remote job listings | No auth required | Free |
| GitHub REST API | User profile, repos, languages | Optional token | Free |
| Codeforces API | Rating, contests, solved problems | No auth required | Free |
| LeetCode GraphQL | Stats, solved count | No auth required | Free (unofficial) |

---

## Build Phases

### Phase 1 — Foundation (Days 1-3)
- GitHub repo setup
- React + Vite project initialized
- FastAPI project initialized
- Supabase project created (auth + tables)
- Vercel + Render deployment configured
- Landing page built

### Phase 2 — Auth + Onboarding (Days 4-6)
- Login + Register pages with Supabase Auth
- Career assessment questionnaire (multi-step form)
- Results page with AI-generated career path suggestions

### Phase 3 — Core Dashboard (Days 7-12)
- Dashboard home with overview cards
- AI roadmap generation (NVIDIA NIM)
- Skill gap analyzer
- Certifications tracker
- Course recommendations

### Phase 4 — Data Integration (Days 13-18)
- Real internship listings (Adzuna + Remotive)
- GitHub profile integration
- Codeforces profile integration
- LeetCode stats integration

### Phase 5 — AI Chatbot + PDF (Days 19-22)
- Floating AI chat widget
- Context-aware chatbot (knows user's career path)
- Roadmap PDF download (jsPDF)

### Phase 6 — Polish + Demo Prep (Days 23+)
- UI polish across all pages
- Mobile responsiveness
- Loading states and error handling
- Demo walkthrough preparation

---

## Code Standards

Every file must follow these rules:

1. Every component file starts with a comment block explaining what it does
2. Every function has a one-line comment above it explaining what it does and what it returns
3. Every API call has a comment explaining the endpoint, what data it sends, and what it returns
4. Every environment variable usage is commented with what the variable is
5. Config files (.env.example, vite.config.js, tailwind.config.js) are fully commented

This is non-negotiable. Every line of code must be explainable to a mentor panel.

---

## Team

| Role | Member |
|---|---|
| Team Leader + Full Stack Developer | Jake (Bingi Dinesh Kumar) |
| Team Member | Member 2 |
| Team Member | Member 3 |
| Team Member | Member 4 |
| Team Member | Member 5 |

**Internship:** Infosys Springboard Virtual Internship 7.0
**Batch:** Batch 1
**Training Start:** 29th June 2026
**Final Demo:** TBD

---

*CareerSpark — Because every student deserves a clear starting point.*
