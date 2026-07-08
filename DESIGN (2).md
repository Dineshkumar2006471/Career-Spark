# CareerSpark — DESIGN.md
### Visual Identity, UI Flow & Component System
> Reference-grounded in institutional SaaS design language (Coinbase, IBM Carbon, Cal.com pattern family via getdesign.md catalog) + functional patterns from Teal HQ, Huntr, Jobscan, and Nexvo.AI (India-focused campus placement tool)
> Rule: **no glassmorphism, no purple, no decorative gradients.** Flat surfaces, hairline dividers, one shadow tier, confident whitespace.

---

## 0. Why this direction (read this before building anything)

You asked for "professional SaaS, like we're delivering to a client" — that rules out three things AI-generated UIs default to without being asked: (1) glassmorphism/frosted-blur cards, (2) purple-as-default-accent, (3) heavy gradients as a substitute for a real layout decision. This doc replaces all three with a flat, institutional-blue system borrowed from the same design family banks and exchanges use when the product has to feel trustworthy with someone's personal data — which is exactly what CareerSpark is asking students for (resume, contact info, location, career history).

**Functional reference points** (what to borrow, not to copy):
- **Teal HQ** — dashboard as a single home base pulling resume, roadmap, and goals into one view. CareerSpark's Dashboard Home follows this "everything visible at a glance" logic.
- **Huntr** — clean Kanban-style organization and a snappy, uncluttered UI. Borrow the information density discipline, not the Kanban itself.
- **Jobscan** — leads with a single authoritative score (ATS match %). CareerSpark's Resume Analyzer does the same with its ATS Score.
- **Nexvo.AI** — India-specific placement dashboards for engineering students, proving this exact audience responds well to a dashboard-first, metrics-visible design (not a chat-first or feed-first design).

### Compliance with the frontend-design skill brief

You uploaded the studio brief (SKILL.md) alongside this — here's exactly where this doc satisfies each of its principles, so you can check it isn't just a generic system with your name on it:

| Skill principle | Where it's satisfied here |
|---|---|
| Ground it in the subject | This section — a specific anxious Class-12 student, a specific single job for the page, stated up front, not a generic "SaaS landing page" |
| The hero is a thesis | §5 — headline + a real Match Compass result, not a template stat-plus-gradient |
| Typography carries personality | §2 — Space Grotesk / Inter / JetBrains Mono, chosen for roles, not "Inter everywhere because it's safe" |
| Structure is information | §5 "How it works" 01–04 is a real sequence (question order matters); §8 dashboard metrics are ordered by actual priority, not alphabetically |
| Avoid the three AI-default looks | §1 — explicitly not cream+serif+terracotta, not near-black+acid-accent, not broadsheet-hairline-newspaper. Signal Blue was chosen because it matches "trustworthy with personal data," not because it's a fourth default |
| Motion is deliberate, not scattered | §5 Motion — one orchestrated load sequence, one scroll behavior, nothing else animates |
| Spend boldness in one place | §6 — the Match Compass is the one signature element; everything else stays flat and quiet |
| Writing is design material | §5 hero copy is written for this exact reader, not filler ("Welcome to CareerSpark!") |
| Quality floor: responsive, focus states, reduced motion | §9 (responsive breakpoints), `input` focus ring in §4, `prefers-reduced-motion` called out explicitly in §5 |

---

## 1. Color System

One brand blue, monochrome ink/surface scale, semantic colors used only for status — never decoration.

### Brand & Accent
| Token | Hex | Usage |
|---|---|---|
| `primary` (Signal Blue) | `#1652F0` | Primary CTAs, active nav item, links, brand mark |
| `primary-hover` | `#1140C4` | Hover/press state |
| `primary-tint` | `#E8EEFF` | Selected row backgrounds, chip fills on white |
| `primary-disabled` | `#AAB9E8` | Disabled CTA |

### Surface (Light — default app theme)
| Token | Hex | Usage |
|---|---|---|
| `canvas` | `#FFFFFF` | Default page background |
| `surface-soft` | `#F6F7F9` | Sidebar background, alternating rows |
| `surface-strong` | `#EDEFF3` | Secondary buttons, input backgrounds |
| `surface-dark` | `#0B0E14` | Landing page hero band only — full-bleed dark section |
| `surface-dark-elevated` | `#161A22` | Cards floating inside the dark hero |

### Hairlines & Text
| Token | Hex | Usage |
|---|---|---|
| `hairline` | `#DEE1E6` | 1px dividers, card borders — this is the primary structural device, not shadows |
| `ink` | `#0B0E14` | Headings, primary nav labels |
| `body` | `#545B66` | Running text |
| `muted` | `#8A909B` | Captions, timestamps, placeholder text |

### Semantic (status only — never used decoratively)
| Token | Hex | Usage |
|---|---|---|
| `success` | `#16A34A` | Career match score fill, "completed" states, positive skill-gap closing |
| `warning` | `#D97706` | "In progress," ATS score mid-range, incomplete profile nudge |
| `error` | `#DC2626` | Failed uploads, critical skill gaps, form validation |
| `info` | `#1652F0` (same as primary) | Neutral informational badges |

**Explicitly avoid:** purple/violet anywhere in the palette (including chart series colors), any `rgba(255,255,255,0.x)` frosted panel, `backdrop-filter: blur`, or gradient buttons. If a component "needs" a gradient to look finished, the layout needs fixing instead.

---

## 2. Typography

Three-family system, each with one job. All free, open-license, no cost to the team.

| Role | Family | Where |
|---|---|---|
| Display / Headings | **Space Grotesk** (500–600 weight) | Landing hero, section titles, dashboard page titles |
| Body / UI | **Inter** (400–500 weight) | Paragraphs, nav labels, buttons, form fields, table content |
| Data / Metrics | **JetBrains Mono** (500 weight) | Career match %, resume score, salary figures, stat numbers — mono makes numbers feel measured/precise, which matters for a platform making claims about someone's career |

Both are free via Google Fonts — `@import` or self-host, no licensing cost.

### Type Scale
| Token | Size / Weight / Line-height | Example |
|---|---|---|
| `display-lg` | 56px / 600 / 1.05 | Landing hero headline |
| `display-md` | 36px / 600 / 1.15 | Section headings ("Your Career, Mapped") |
| `title-lg` | 24px / 600 / 1.3 | Dashboard page titles |
| `title-md` | 18px / 600 / 1.4 | Card titles |
| `body-md` | 16px / 400 / 1.6 | Default paragraph |
| `body-sm` | 14px / 400 / 1.5 | Secondary text, table rows |
| `caption` | 12px / 500 / 1.4, uppercase, +0.04em tracking | Badge labels, section eyebrows |
| `metric-lg` (mono) | 40px / 500 | Career Match Score number |
| `metric-sm` (mono) | 20px / 500 | Supporting stat cards |

---

## 3. Spacing, Radius & Elevation

### Spacing — 4px base unit
```
xxs 4   xs 8   sm 12   base 16   md 20   lg 24   xl 32   xxl 48   section 96
```
Use `section` (96px) between major landing-page sections, `xl` (32px) between dashboard cards, `base`/`md` inside cards. Consistent rhythm reads as intentional; random one-off margins are the #1 tell of an unpolished build.

### Border Radius — restrained, not pill-everything
| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Inputs, chips, small buttons |
| `radius-md` | 10px | Primary/secondary buttons, dropdowns |
| `radius-lg` | 16px | Cards, modals |
| `radius-none` | 0px | Data tables, dividers |

We deliberately stop short of full-pill (100px) buttons here — that reads more "consumer fintech app" than "enterprise SaaS dashboard," and a career platform being handed to a client should read closer to the latter.

### Elevation — flat by default, one shadow tier only
- **80% of surfaces are flat** with a 1px `hairline` border — no shadow at all.
- **One soft shadow tier** for anything that floats above content (dropdowns, modals, the floating AI chat widget): `0 4px 16px rgba(11,14,20,0.08)`.
- **Never** stack multiple shadow layers, never use blur-behind (`backdrop-filter`), never use colored/glowing shadows. This single rule is what most directly avoids the glassmorphism look.

---

## 4. Core Components

| Component | Spec |
|---|---|
| `button-primary` | Signal Blue fill, white text, `radius-md`, 44px height, no shadow |
| `button-secondary` | White fill, `hairline` border, `ink` text, `radius-md` |
| `button-text` | No fill, `primary` text, underline on hover only |
| `input` | `surface-strong` fill, no border by default, `hairline` border on focus + 2px `primary-tint` focus ring, `radius-sm` |
| `card` | `canvas` fill, 1px `hairline` border, `radius-lg`, `lg` internal padding |
| `badge` | `caption` type, `radius-sm`, tinted background matching its semantic color at 10% opacity |
| `nav-item-active` | `primary-tint` background, `primary` text, left 3px `primary` accent bar |
| `progress-ring` | Signature component — see Section 6 |

---

## 5. Landing Page — Structure & Storytelling

**Single job of this page:** convince a confused Class-12-pass student that this platform will tell them, specifically, what to do next — and prove it in the first screen.

### Hero (dark band — `surface-dark`)
Real copy, not filler:
> **Eyebrow:** FOR STUDENTS WHO JUST FINISHED CLASS 12
> **Headline (display-lg, white):** "You don't need to know your career yet. You need your next 90 days."
> **Subhead (body-md, muted on dark):** Answer a few questions. Get a real roadmap — skills, certifications, courses, and internships — built for where you are right now.
> **CTA row:** `button-primary` "Start Free" · `button-text` "See how it works ↓"

Below the headline: a floating **Match Compass** card (the signature element, see Section 6) showing a sample career match result (`"Frontend Development — 87% match"`), positioned like a product screenshot — this is the single concrete proof-of-value the hero needs, not a generic illustration.

### Image Generation Rules — read this before generating anything for Landing or Login

**On the model name:** "Image 2.0" isn't a current Google product name — the model you want is **Imagen 4**, Google's dedicated text-to-image model (accessible via Gemini API / Google AI Studio / the Gemini app's image tools). It's built for clean, one-shot, production-quality generation, which is what a locked marketing visual needs — as opposed to Nano Banana/Nano Banana Pro, which are Gemini's *conversational* image-editing models, better suited to iterating on a single image back-and-forth than to producing a consistent visual system. **Use Imagen 4 for every generated image on this platform.**

**The real problem you're describing isn't the model — it's faces.** The "AI-generated/cartoonish" tell almost every viewer clocks instantly comes from generated human faces: slightly waxy skin, off eyes, extra/warped fingers, a too-smooth "airbrushed" quality. This happens across every image model, Imagen included. Official sites you're benchmarking against (the ones that don't look AI-made) solve this one of two ways, and CareerSpark should too:

1. **Anywhere a human face would appear** (login/register side panel, testimonial photos, any "student using the app" imagery) — **do not generate it with AI.** Use real photography instead: free sources like Unsplash/Pexels, or better, actual photos of your own team/campus if you have them. This is the single highest-leverage decision for hitting "looks like a real official website" — real photography of real people will always read as more professional than generated faces, no matter how good the model gets.
2. **Everywhere else** (hero background, section dividers, empty-states, icons) — generate with Imagen 4, locked to a **flat geometric illustration style with no human faces at all.** This sidesteps the face problem entirely and matches how a lot of serious SaaS sites (Stripe, Notion, Linear) actually handle illustration — abstracted shapes and motifs, not attempted photorealism.

**Locked style brief — reuse this exact language every time you prompt Imagen 4**, so every image looks like it came from one design system, not five different tools:
> *"Minimal flat vector illustration, 2D, no photorealism, no human faces, color palette strictly limited to #1652F0 (blue), #0B0E14 (near-black), and white, one #16A34A green used only as a single accent point, thin 2px line weight throughout, generous negative space, no gradients, no drop shadows, no text in the image, no cartoon mascot characters, no 3D render, clean geometric composition"*

**Two ready-to-use prompts:**
- *Landing hero / section divider:* "Minimal flat vector illustration, a single ascending line forming a path toward a small glowing dot at its peak, color palette strictly #1652F0 blue, #0B0E14 near-black and white only, one small #16A34A green accent at the path's endpoint, thin 2px lines, generous negative space, no gradients, no text, no human figures, no 3D, clean 2D geometric style"
- *Empty-state (e.g. "no internships saved yet"):* "Minimal flat vector illustration of an empty open folder with a single dotted line trailing off the edge of the frame, #1652F0 blue and #0B0E14 near-black on white only, thin line weight, no gradients, no text, no human figures, generous negative space"

**Never** use these images as full-bleed photos behind headline text — photo/illustration-behind-text is the single biggest cause of illegible headlines, regardless of how good the image is. Use them as standalone panels/dividers instead.

### Login / Register Page — Layout

Split-screen, roughly 60/40:
- **Left (60%, `canvas` white):** the actual form — email/password fields, a `button-secondary`-styled "Continue with Google" (Supabase OAuth), a toggle link between Login and Register, CareerSpark wordmark top-left. This side never carries imagery — forms need zero visual competition.
- **Right (40%, `surface-dark`):** one image only, following the Image Generation Rules above (real photography if it includes a face, Imagen-4 flat illustration if it doesn't), with one short reinforcing line in white `title-md` overlaid near the bottom — e.g. "Your roadmap is waiting." No CTA, no form field on this side; it's mood/brand only.
- **Mobile (< 640px):** the right panel drops entirely. Form goes full width, wordmark centered above it.

### Section flow below the hero
1. **The problem** (3-up card grid): "You don't know the field. You don't know the skills. You don't know where to start." — short, honest, mirrors the actual student anxiety
2. **How it works** (numbered 01–04 — legitimate here because it's a real sequence): Assess → Get your roadmap → Close the gaps → Get hired-ready
3. **Feature proof strip**: Resume Analyzer, RAG Chatbot, Mock Interview, Internship Discovery — each with one real UI screenshot, not icons alone
4. **Social proof / stats band**: on `surface-soft`, plain numbers in `metric` mono type (e.g. "500+ free certifications indexed," "Real internships, not mock data")
5. **Final CTA band** (`surface-dark` again, bookends the page): repeats the hero CTA

### Motion (subtle, not scattered)
- Page load: hero headline + Match Compass fade/rise in, staggered by ~80ms — one orchestrated moment, not per-element confetti
- Scroll: each section fades up 12px as it enters viewport, once, no re-triggering, no parallax layers (parallax reads as decorative rather than functional here)
- Hover: cards lift 2px with the single shadow tier only — no scale/glow
- Respect `prefers-reduced-motion` — disable all of the above for users who set it

---

## 6. Signature Element: the Match Compass

CareerSpark's one memorable, reused visual motif — a radial arc gauge that shows a percentage as a "direction," reinforcing the product's actual job (pointing someone toward a career). Used in exactly three places so it stays a signature, not wallpaper:
1. Landing hero (sample result)
2. Dashboard Home (real Career Match Score — the top metric)
3. Resume Analyzer (ATS Score, same visual language, proving the two scores are part of one system)

```
        ╭──────────────╮
       ╱   ●●●●●●●●    ╲
      │   ●        ●    │
      │  ●    87%   ●   │   ← metric-lg mono number, center
      │   ●        ●    │
       ╲   ●●●●●●●●    ╱
        ╰──────────────╯
     Frontend Development
        "Strong match"
```
Arc fill uses `success` green above 70%, `warning` amber 40–70%, `hairline` gray below — the only place color is used to communicate meaning at a glance.

---

## 7. Full UI Flow

```
Landing (/)
   │
   ▼
Login (/login)  ──── Register (/register)
   │  (email/password or Google OAuth — Supabase Auth)
   ▼
[FIRST LOGIN ONLY]
Profile Creation Wizard (/onboarding/profile)  ← NEW, mandatory, LinkedIn-style
   │
   ▼
Dashboard Home (/dashboard)
   │  (if Career Assessment not yet taken → prominent banner CTA)
   ▼
Career Assessment (/onboarding/assessment) ── Results (/onboarding/results) ── Choose Path (/onboarding/choose)
   │
   ▼
Dashboard Home (fully unlocked: roadmap, skill gaps, suggestions all populated)
```

**Design decision worth flagging:** you asked for Login → Profile Creation → Dashboard directly. I've kept it exactly that way, and moved Career Assessment to be a prompted step *inside* the dashboard rather than another mandatory gate before it — a student sees their dashboard immediately (fast payoff, standard SaaS activation pattern), and a single clear banner drives them into the assessment to unlock the roadmap. If you'd rather force the assessment before the dashboard too, that's a one-line routing change — flag it and I'll redo this section.

### Profile Creation Wizard — field-by-field
Multi-step, one topic per screen, progress dots at top (not a % bar — 4 discrete steps read as less effort than a slow-moving percentage):

**Step 1 — You**
- Profile photo (upload + crop, circular preview)
- First name / Last name
- Phone number (with country code selector, default +91)
- Email (prefilled from auth, read-only)

**Step 2 — Where you are**
- City / State (text, autocomplete)
- Exact location — use the **free browser Geolocation API** + **OpenStreetMap/Leaflet** for the map pin (Google Maps' free tier has usage limits that can break mid-hackathon; Leaflet + OSM has none)
- Full address (optional, collapsed by default — don't force a full postal address on a career platform, it reads as over-collection for what the product needs)

**Step 3 — Education & Experience**
- Institution name
- Degree / Course (dropdown + "Other")
- Branch / Specialization
- Current year
- Experience toggle: "Student / Fresher" vs "Some experience" → if latter, one free-text field (no rigid work-history table at this stage; that's what the resume upload is for)

**Step 4 — Links & Goals**
- GitHub, LinkedIn, Portfolio URL (all optional)
- One free-text field: "What are you hoping to figure out?" — feeds directly as context into the Career Assessment and RAG chatbot later
- `button-primary` "Finish setup →"

On submit → redirect straight to `/dashboard`.

---

## 8. Dashboard — Layout & Navigation

### Structure
```
┌──────────┬────────────────────────────────────────────┐
│          │  Topbar: page title · search · avatar       │
│ Sidebar  ├────────────────────────────────────────────┤
│          │                                              │
│ ● Home        │  [Career Match Compass — hero metric,    │
│ ○ Roadmap     │   full width top row]                   │
│ ○ Skills      │                                          │
│ ○ Certs       │  [Stat cards row: Roadmap %, Skills done,│
│ ○ Courses     │   Certs earned, Resume Score]            │
│ ○ Internships │                                          │
│ ○ Resume      │  [Skill Gap radar chart]  [Suggestions   │
│ ○ Interview   │   panel: "Next best action"]             │
│ ○ Profile     │                                          │
│               │  [Roadmap phase stepper — Foundation →   │
│               │   Intermediate → Job-Ready]               │
│               │                                          │
└──────────┴────────────────────────────────────────────┘
                                              ╭───╮
                                              │ 💬│ ← floating AI chat,
                                              ╰───╯   every dashboard page
```

- **Sidebar**: `surface-soft` background, persistent across every dashboard route, active item gets `nav-item-active` treatment (Section 4). One icon + one label per item — no nested flyout menus, this audience needs zero ambiguity about where things live.
- **Topbar**: page title in `title-lg`, global search (searches roadmap/skills/internships at once), avatar dropdown (Profile, Settings, Logout).
- **Floating AI chat**: fixed bottom-right, `radius-lg`, single shadow tier, present on all 9 dashboard screens — this is the "common shortcut to ask questions" you asked for. Clicking expands a side panel (not a full modal, so the dashboard stays visible underneath) with the RAG-powered chatbot from PROJECT.md Feature 12.

### Dashboard Home — key metrics (in priority order)
1. **Career Match Score** (Match Compass, hero position, largest element on the page — this is the one metric everything else supports)
2. **Roadmap Progress** — % complete, phase stepper
3. **Skills Completed** vs total required — small radial or bar
4. **Certifications Earned** — count + next recommended cert
5. **Resume Score** — pulls from Resume Analyzer, links directly to that page
6. **Skill Gap radar chart** — visual, shows current vs. required skill vectors at a glance (better than a table for "what's missing")
7. **Suggestions panel** — 2-3 NIM-generated "next best action" cards, plain language ("Finish the AWS Cloud Practitioner cert — you're 80% done" not "Recommendation #3")

Every other feature (Certifications, Courses, Internships, Resume, Interview) gets its **own dedicated full screen** as you requested — the dashboard home is a summary/launchpad, not where deep work happens.

---

## 9. Responsive Behavior

| Breakpoint | Width | Key changes |
|---|---|---|
| Mobile | < 640px | Sidebar collapses to bottom tab bar (5 primary items + "More"); hero headline 56→32px; stat cards stack 1-up; floating chat becomes full-screen on open |
| Tablet | 640–1024px | Sidebar collapses to icon-only rail (labels on hover/tap); stat cards 2-up |
| Desktop | 1024–1440px | Full sidebar with labels; stat cards 4-up |
| Wide | > 1440px | Content caps at 1280px, centered — never let cards stretch full-width on large monitors |

---

## 10. What NOT to do (explicit anti-patterns for this project)

- ❌ No `backdrop-filter: blur()` anywhere
- ❌ No purple/violet in any palette, chart, or gradient
- ❌ No decorative gradients on buttons or cards (flat fills only)
- ❌ No stock photos of generic students smiling at laptops
- ❌ No more than one shadow tier in the entire app
- ❌ No auto-playing background video
- ❌ No skeuomorphic icons (3D, glossy) — use simple line icons (Lucide, free, matches the flat/hairline system)

---

*CareerSpark DESIGN.md — one visual language, every screen, no exceptions.*
