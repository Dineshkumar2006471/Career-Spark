# CareerSpark Phase 1 Plan

## Scope
- Build only Phase 1: foundation, project structure, environment templates, Supabase schema wiring, deployment config, and the landing page.
- Stop after Phase 1 verification for user review before starting Phase 2.

## Checklist
- [x] Initialize repository foundation and protect secrets with `.gitignore`.
- [x] Preserve canonical `PROJECT.md` and `DESIGN.md` copies from the provided spec files.
- [x] Scaffold `frontend/` with React 18, Vite, Tailwind CSS, React Router v6, and the exact folder structure from `PROJECT.md`.
- [x] Scaffold `backend/` with FastAPI, routers, services, models, config, and `.env.example`.
- [x] Add Supabase SQL wiring for Phase 1 tables with RLS enabled and explicit Data API grants.
- [x] Add Vercel frontend config and Render backend Blueprint config.
- [x] Implement the landing page exactly from `DESIGN.md` Section 5, including one reusable Match Compass component.
- [x] Verify local frontend build and backend import/health route.

## Review
- `npm run build` passed in `frontend/`.
- `npm run lint` passed in `frontend/`.
- FastAPI `TestClient(app).get("/health")` returned HTTP 200 with `{"status": "ok", "service": "careerspark-api"}`.
- Vite dev server is running at `http://127.0.0.1:5173/` and returned HTTP 200.
- Secret scan found no pasted NVIDIA or Adzuna keys in repository files.
- Authenticated Supabase and Render credential tools were not available in this session; secure `.env.example`, SQL, Vercel config, and Render Blueprint files are prepared for dashboard/plugin completion.

# Full MVP Continuation Plan

## Scope
- Continue beyond Phase 1 per user request and build an integrated full-project MVP.
- Use real human photography for storytelling where faces appear; keep generated visuals limited to non-human abstract assets.
- Preserve secrets in `.env` only and keep `.env.example` as placeholders.

## Checklist
- [x] Replace generic landing visuals with real narrative photography and improve storytelling.
- [x] Build split-screen Login/Register UI with Supabase-ready auth handlers.
- [x] Build Profile Creation Wizard, Career Assessment, Results, and Choose Path flow.
- [x] Build Dashboard shell with sidebar/topbar/chat across 9 dashboard screens.
- [x] Build Dashboard Home, Roadmap, Skills, Certifications, Courses, Internships, Resume, Interview, and Profile pages.
- [x] Implement backend Pydantic request/response models for all feature areas.
- [x] Implement async backend services for NVIDIA NIM, Adzuna, Remotive, GitHub, Codeforces, LeetCode, resume scoring, and vector-ready placeholders.
- [x] Add in-memory TTL caching for public profile APIs.
- [x] Extend Supabase SQL tables/RLS for full MVP features.
- [x] Verify frontend build/lint and backend health/import checks.

## Review
- Real photography assets saved in `frontend/src/assets/student-collaboration.jpg` and `frontend/src/assets/student-roadmap-login.jpg`.
- Image source: Pexels photos by Sanket Mishra, downloaded from public Pexels image URLs.
- `npm run build` passed in `frontend/`.
- `npm run lint` passed in `frontend/`.
- `python -m compileall .` passed in `backend/`.
- FastAPI smoke checks passed for `/health`, `/chatbot/ask`, `/internships/search`, `/resume/analyze`, and `/interview/feedback`.
- Secret and design scan found no pasted API keys, no purple/violet/gradient/backdrop-filter usage in authored app code, and no hardcoded one-off hex values outside central design tokens.

# Sort Reference UI Pass

## Scope
- Use `https://sort.to/?ref=minimal.gallery` as visual/product-flow reference.
- Adapt patterns, not brand assets: quiet top nav, centered hero thesis, single large product proof panel, compact feature grid, editorial whitespace, minimal app-like cards, restrained CTAs.
- Apply the same product language across landing, auth, onboarding, and dashboard.

## Checklist
- [x] Landing page rebuilt around centered hero and large product proof panel.
- [x] Auth pages restyled as minimal split app panels.
- [x] Onboarding pages restyled with quieter centered cards.
- [x] Dashboard restyled with calmer nav, tighter cards, and product-panel rhythm.
- [x] Verify build, lint, and key route smoke checks.

## Review
- Adapted the Sort reference into CareerSpark without copying brand/content: centered thesis hero, quiet nav, large proof panel, compact feature evidence, editorial whitespace, and minimal product cards.
- Preserved CareerSpark requirements: Match Compass remains only on landing, dashboard home, and resume analyzer.
- `npm run build` passed.
- `npm run lint` passed.
- Vite route smoke checks returned HTTP 200 for `/`, `/login`, `/onboarding/profile`, and `/dashboard`.

## Follow-up Visual Storytelling Pass
- Reworked the landing page again to better match the Sort reference's warm background, image-led sections, and footer composition.
- Hero headline is now explicitly two lines: "Your next 90 days," / "sorted into one career plan."
- Every requested content block is paired with either a real photo, app-style mini panel, or icon/product proof card.
- Footer now uses a dark brand section with real student photography and product-status storytelling instead of a plain link strip.
- Verification: `npm run build`, `npm run lint`, and `/` route smoke check all passed.

# Full Feature Audit And Fix Pass

## Scope
- Check all PROJECT.md screens and real integrations against the current implementation.
- Fix verified gaps that block real user flows.
- Attempt CodeRabbit review and document any tooling blocker honestly.

## Checklist
- [x] Compare implemented pages and backend routers against PROJECT.md.
- [x] Confirm CodeRabbit CLI availability.
- [x] Connect AI roadmap generation to the dashboard roadmap screen.
- [x] Add backend resume file parsing to the frontend Resume Analyzer.
- [x] Add AI-backed assessment analysis endpoint and route onboarding results through saved matches.
- [x] Convert Certifications into a Supabase-backed progress tracker.
- [x] Make floating chatbot send saved profile, roadmap, and skill-gap context to the backend.
- [x] Re-run frontend and backend verification.
- [x] Document remaining external credential blockers.

## Review
- Fixed the registration flow so submit buttons fire correctly and Supabase email-confirmation mode shows a clear notice when no session is returned.
- Connected `/assessment/analyze` to onboarding, with NVIDIA NIM JSON parsing and deterministic fallback matches.
- Connected `/roadmap/generate` to the dashboard roadmap page, with persisted Supabase phases and PDF export using the current roadmap.
- Added `/resume/analyze-file` for PDF, DOCX, and TXT uploads; parser imports are lazy so missing optional parser packages do not crash the API.
- Converted Certifications into a Supabase-backed tracker with recommended / in-progress / completed states.
- Made the floating chatbot send saved profile, roadmap, and skill-gap context to the backend.
- CodeRabbit CLI review could not run because `coderabbit` is not installed in this environment; the earlier installer attempt failed due a missing `unzip` dependency.
- Adzuna real listings still require `ADZUNA_APP_ID`; only the Adzuna key was provided. Remotive live listings work without credentials.
- Server-side Supabase service-role workflows remain limited because the service-role key was not exposed by the available Supabase connector; browser-side RLS-backed persistence is configured and verified.
- Verification passed: `npm run lint`, `npm run build`, `python -m compileall .`, FastAPI TestClient checks for health/assessment/roadmap/resume/chatbot/internships, live frontend route checks, and live backend `/health`.

# Profile-Driven Auth And Analytics Pass

## Scope
- Fix login/register flow so authenticated users create a profile before dashboard usage.
- Expand onboarding profile to official student profile fields.
- Make dashboard analytics, roadmap, internships, and chatbot use saved profile data instead of fixed defaults.

## Checklist
- [x] Add live Supabase columns for address, location, skills, projects, applications, achievements, experience, current course, and resume feedback.
- [x] Update login/register redirects toward profile creation.
- [x] Enforce profile completion before dashboard access.
- [x] Expand profile wizard to collect official student profile details and resume upload analysis.
- [x] Feed dashboard analytics from profile, roadmap, certifications, resume history, and skill progress.
- [x] Feed internship search from profile location/current course/chosen roadmap.
- [x] Feed roadmap generation and chatbot from profile context.
- [x] Verify build, lint, backend compile, and route/API health.

# Resume Upload CORS And Adzuna Credential Fix

## Scope
- Add the provided Adzuna App ID.
- Find the exact cause of profile resume upload `Failed to fetch`.
- Verify PDF/TXT upload and CORS from the in-app browser origin.

## Checklist
- [x] Confirm `ADZUNA_APP_ID` was blank in backend local env.
- [x] Confirm CORS preflight from `http://127.0.0.1:5173` lacked an allow-origin response.
- [x] Configure backend CORS to allow both `localhost:5173` and `127.0.0.1:5173`.
- [x] Restart backend and verify CORS preflight plus resume upload endpoint.

## Review
- Root cause of resume upload `Failed to fetch`: browser origin was `http://127.0.0.1:5173`, but FastAPI CORS only allowed `http://localhost:5173`.
- Backend now supports `FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`.
- Verified CORS preflight returns `access-control-allow-origin: http://127.0.0.1:5173`.
- Verified real PDF upload over HTTP returns 200 with ATS score, suggestions, and extracted text.
- Added the provided Adzuna App ID to local backend env and verified Adzuna returns live internship listings.

# Profile Completion And Dashboard Shell Fix

## Scope
- Fix onboarding resume upload copy so profile creation only shows upload progress, not ATS scoring.
- Ensure finishing profile creation persists completion and redirects to the dashboard.
- Add a consistent authenticated profile menu across the dashboard shell.
- Keep the desktop sidebar fixed while only dashboard content scrolls.
- Rework the profile page into a full student profile layout with details, summary, and proof sections.

## Checklist
- [x] Remove onboarding-time ATS score display from resume upload.
- [x] Make profile save/redirect verify the saved completed profile.
- [x] Add dashboard profile initials menu with Profile and Logout actions.
- [x] Lock sidebar/topbar and make the main dashboard content the scrolling region.
- [x] Upgrade the dashboard profile page layout.
- [x] Verify lint, build, and route smoke checks.

## Review
- Onboarding resume upload now shows `Uploading resume...` and then `Uploaded`; ATS analysis still runs quietly so dashboard metrics can use the result.
- Profile setup now preloads existing saved profile details, saves arrays defensively, verifies the saved row is complete, and redirects to `/dashboard` with history replacement.
- Authenticated navigation now uses a shared initials profile menu with Profile and Logout actions on public/onboarding nav and dashboard topbar.
- Dashboard shell now uses a fixed-height frame; the desktop sidebar stays fixed and only the main content pane scrolls.
- Dashboard profile page now presents a fuller student profile: avatar initials, summary, contact/location, education, resume, skills, projects, experience, applications, achievements, links, and coding integrations.
- Verification passed: `npm run lint`, `npm run build`, live route checks for `/`, `/login`, `/onboarding/profile`, `/dashboard`, and `/dashboard/profile`, plus an in-app browser smoke check for `/login`.

# Onboarding Redirect Regression Fix

## Scope
- Fix the remaining issue where Finish setup saves but the dashboard guard redirects back to `/onboarding/profile`.
- Keep the fix narrow: profile completion state, guard behavior, and verification.

## Checklist
- [x] Add an immediate verified completion marker after successful profile save.
- [x] Teach the dashboard guard to accept the current user's verified completion marker while Supabase reloads.
- [x] Clear the marker on logout/session changes where needed.
- [x] Verify lint/build and affected routes.

## Review
- Root cause: `/dashboard` was protected by a profile-completion guard that could still read incomplete/stale profile state immediately after Finish setup, so it redirected back to `/onboarding/profile`.
- Fix: after Supabase confirms profile save with `onboarding_completed`, the app writes a session-scoped completion marker for the current user. The dashboard guard accepts that marker while Supabase reloads the saved row.
- Secondary skill progress persistence no longer blocks redirect; profile completion is the source of truth, and skill progress saves in the background.
- Verification passed: `npm run lint`, `npm run build`, and route checks for `/onboarding/profile`, `/dashboard`, and `/dashboard/profile`.

# Deterministic Profile Completion Root-Cause Fix

## Scope
- Remove the remaining silent failure path where profile save could return `null` without a persisted row.
- Prevent completed users from seeing the blank first-login wizard again.
- Keep explicit profile editing available without breaking the first-login flow.

## Checklist
- [x] Make owned Supabase writes throw when no authenticated user is available.
- [x] Add shared onboarding completion state helper used by wizard, guard, and logout.
- [x] Redirect completed profiles from `/onboarding/profile` to `/dashboard`.
- [x] Reserve `/onboarding/profile?edit=1` for editing an existing profile.
- [x] Hide the blank profile form while saved profile state is loading.
- [x] Verify lint, build, and affected routes.

## Review
- Root cause found in root code: `saveProfile()` depended on `upsertOwned()`, but `upsertOwned()` returned `null` when `getCurrentUser()` could not provide an authenticated user. The profile wizard treated that as success, navigated, and then the dashboard guard redirected back because no completed profile row existed.
- Second root cause: `/onboarding/profile` always rendered the first-login wizard while `loadProfile()` was still checking, so completed users could still see the blank first-name/last-name start page.
- Fix: Supabase owned writes now throw if the user session is unavailable; successful profile save requires a real saved row with `onboarding_completed`.
- Fix: completed users hitting `/onboarding/profile` are redirected to `/dashboard`; editing uses `/onboarding/profile?edit=1`.
- Verification passed: `npm run lint`, `npm run build`, and route checks for `/onboarding/profile`, `/onboarding/profile?edit=1`, `/dashboard`, and `/dashboard/profile`.

# Dashboard Grounded Analysis And Resource Pass

## Scope
- Replace demo-like dashboard/course/skill data with profile, resume, roadmap, and target-role grounded analysis.
- Add explicit target role capture in profile setup without requiring a live DB migration.
- Add direct course, virtual internship, and government internship links from official/external platforms.
- Fix mock interview microphone behavior with continuous/interim Web Speech API handling.
- Verify backend API traffic for health, roadmap, interview, and internships.

## Checklist
- [x] Add shared career analysis helper for target role, readiness, shortlisting signals, and skill gaps.
- [x] Add target role input to profile setup and parse it for dashboard analysis.
- [x] Rework dashboard home around hiring readiness and recruiter-style diagnosis.
- [x] Rework skills page around target-role gap ranking and direct learning/simulation links.
- [x] Rework courses page into a role/gap-based resource hub with direct external links.
- [x] Improve mock interview speech recognition state, interim transcript, stop control, and profile-based prompt.
- [x] Verify backend health, roadmap, interview, and Adzuna internship endpoints.
- [x] Verify frontend lint, build, and affected routes.

## Review
- Dashboard home no longer depends on static `sampleData` skill rows for the main diagnosis. It uses saved profile, roadmap, resume history, and persisted skill rows to calculate readiness and shortlisting risks.
- Profile setup now captures `Target role` and stores it in the existing goal note as structured text, avoiding a database migration while still making analysis explicit.
- Skills and Courses pages now generate direct external links for SWAYAM, freeCodeCamp, Coursera, Forage, AICTE Internship Portal, and SWAYAM Plus based on target role and top skill gaps.
- Mock interview now uses continuous/interim browser speech recognition, shows recording state, supports stop, handles speech errors, and personalizes the prompt to the target role.
- Backend checks passed: `/health`, `/roadmap/generate`, `/interview/feedback`, and `/internships/search` all returned responses; Adzuna returned live internship listings.
- Frontend verification passed: `npm run lint`, `npm run build`, and route checks for `/dashboard`, `/dashboard/skills`, `/dashboard/courses`, `/dashboard/interview`, and `/onboarding/profile?edit=1`.

# Rich Roadmap And Dev Server Visibility Fix

## Scope
- Fix the roadmap contract so the backend can return a hiring-grade structured roadmap instead of only three simple cards.
- Verify NVIDIA NIM behavior and expose provider/fallback status in the UI.
- Restart/verify the running frontend dev server so the browser sees the latest code.

## Checklist
- [x] Expand roadmap schema with focus areas, courses, certifications, internships, weekly actions, and proof outputs.
- [x] Update backend NVIDIA prompt and deterministic fallback to the richer roadmap shape.
- [x] Update frontend roadmap renderer and PDF export.
- [x] Verify backend `/roadmap/generate` returns rich fields.
- [x] Restart or verify Vite dev server bundle visibility.
- [x] Run lint/build and route/API checks.

## Review
- Roadmap API now returns and persists the rich phase contract: focus areas, course links, certification links, internships/simulations, weekly actions, and proof outputs.
- Provider status is now truthful: fallback JSON returned because the provider is unavailable, slow, or invalid is reported as `provider_status: "fallback"` instead of being mistaken for NVIDIA output.
- NVIDIA NIM calls now use a 20-second backend timeout so roadmap generation falls back inside a usable UI window.
- Frontend demo/default roadmap phases now use the same rich contract as the backend, so first-load and saved fallback states no longer show thin three-card placeholders.
- Restarted local backend and Vite dev server. Verified `http://127.0.0.1:8000/health`, `http://127.0.0.1:5173/`, and Vite serving the updated `sampleData.js`.
- Verification passed: `python -m compileall .`, `npm run lint`, `npm run build`, and live `/roadmap/generate` returned 3 phases with rich fields and `provider_status: "fallback"` within 21 seconds.
