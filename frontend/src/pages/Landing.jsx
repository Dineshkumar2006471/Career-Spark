import { ArrowRight, Bot, BriefcaseBusiness, CheckCircle2, FileScan, Map, Mic, Search, ShieldCheck, Sparkles } from 'lucide-react'
import studentCollaboration from '../assets/student-collaboration.jpg'
import studentLogin from '../assets/student-roadmap-login.jpg'
import heroBackground from '../assets/hero_background_1783508038659.png'
import assessmentFeature from '../assets/assessment_feature_1783508050376.png'
import levelFeature from '../assets/level_feature_1783508077789.png'
import roadmapFeature from '../assets/roadmap_feature_1783508093056.png'
import dashboardFeature from '../assets/dashboard_feature_1783508104620.png'
import interviewFeature from '../assets/interview_feature_1783508059972.png'
import Button from '../components/ui/Button.jsx'
import MatchCompass from '../components/ui/MatchCompass.jsx'
import PublicNav from '../components/layout/PublicNav.jsx'

const featureStories = [
  ['Choose your path', 'Answer practical questions and compare 1-3 career matches before committing.', assessmentFeature],
  ['Works around your level', 'Built for Class-12-pass students, not people who already have internships.', levelFeature],
  ['Roadmap first', 'Skills, courses, certifications, and applications are ordered into a 90-day plan.', roadmapFeature],
  ['No noisy feed', 'Your dashboard shows the next useful action instead of endless generic advice.', dashboardFeature],
  ['Search and filter', 'Find internships, skills, courses, and roadmap items from one workspace.', studentCollaboration],
  ['Interview practice', 'Use speech-based mock interview prompts when you are ready to apply.', interviewFeature],
]

const proofCards = [
  [FileScan, 'Resume Analyzer', 'Score your resume and get specific fixes.'],
  [Bot, 'RAG Chatbot', 'Ask questions grounded in your profile.'],
  [Mic, 'Mock Interview', 'Practice answers with feedback.'],
  [BriefcaseBusiness, 'Internship Discovery', 'Find real beginner-friendly listings.'],
]

const workflowCards = [
  [Map, 'Roadmap PDF', 'Take the 90-day plan into reviews or mentor meetings.'],
  [Search, 'Unified search', 'Find roadmap, skills, internships, and courses quickly.'],
  [ShieldCheck, 'Student-owned data', 'Supabase RLS keeps each profile scoped to its owner.'],
]

function FeatureStory({ title, description, imageSrc, index }) {
  const isEven = index % 2 === 0;
  return (
    <article className="grid overflow-hidden rounded-3xl bg-canvas shadow-sm md:grid-cols-2 gap-xl items-center p-lg md:p-xl mb-xl border border-hairline">
      <div className={`flex flex-col justify-center px-md ${isEven ? 'md:order-1' : 'md:order-2'}`}>
        <p className="font-mono text-sm text-primary mb-sm font-semibold tracking-widest">0{index + 1}</p>
        <h3 className="font-display text-4xl font-bold leading-tight text-ink mb-md">{title}</h3>
        <p className="text-lg leading-8 text-body">{description}</p>
      </div>
      <div className={`overflow-hidden rounded-2xl shadow-md border border-hairline ${isEven ? 'md:order-2' : 'md:order-1'}`}>
        <img alt={title} className="h-[400px] w-full object-cover transition-transform duration-700 hover:scale-105" src={imageSrc} />
      </div>
    </article>
  )
}

function ProofCard({ Icon, title, description }) {
  return (
    <article className="group flex flex-col items-start rounded-2xl border border-hairline bg-canvas p-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-lg grid h-14 w-14 place-items-center rounded-xl border border-hairline bg-page-warm transition-colors group-hover:bg-primary/10 group-hover:border-primary/20">
        <Icon aria-hidden="true" className="text-primary" size={26} strokeWidth={2} />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-sm text-base leading-relaxed text-body">{description}</p>
    </article>
  )
}

function Landing() {
  return (
    <main className="min-h-screen bg-page-warm text-ink font-sans selection:bg-primary/20">
      <PublicNav />

      {/* Hero Section */}
      <section className="mx-auto max-w-[1280px] px-lg pb-24 pt-16 md:pt-24 lg:pt-32">
        <div className="grid gap-xl lg:grid-cols-[1.1fr_0.9fr] items-center text-left">
          <div className="z-10">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm mb-8 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              For students who just finished Class 12
            </div>
            <h1 className="font-display text-[50px] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-[64px] lg:text-[76px] mb-8">
              Your next 90 days, sorted into one career plan.
            </h1>
            <p className="max-w-2xl text-lg md:text-xl leading-relaxed text-body mb-10">
              CareerSpark turns uncertainty into a focused roadmap: skills to learn, certifications to finish, courses to follow, internships to apply for, and resume fixes to make before you send anything.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button to="/register" className="bg-ink text-white hover:bg-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all px-8 py-3.5 rounded-full text-base font-semibold">
                Start free
                <ArrowRight aria-hidden="true" className="ml-2 w-5 h-5" />
              </Button>
              <Button href="#features" variant="secondary" className="bg-canvas border-hairline hover:bg-surface-soft hover:border-body transition-all shadow-sm px-8 py-3.5 rounded-full text-base font-semibold">
                See features
              </Button>
            </div>
          </div>
          <div className="relative mt-12 lg:mt-0">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl -z-10 rounded-full"></div>
             <div className="overflow-hidden rounded-3xl shadow-2xl border border-hairline bg-canvas">
               <img alt="Student smiling confidently at laptop" className="w-full h-auto object-cover max-h-[600px] lg:max-h-[700px] hover:scale-105 transition-transform duration-[2s]" src={heroBackground} />
             </div>
          </div>
        </div>
      </section>

      {/* Roadmap Proof Section */}
      <section className="mx-auto max-w-[1280px] px-lg py-24" id="roadmap-proof">
        <div className="grid gap-xl lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="overflow-hidden rounded-3xl border border-hairline bg-canvas shadow-lg relative group">
            <img alt="Two Indian students planning career work on a laptop" className="h-[520px] w-full object-cover transition-transform duration-700 group-hover:scale-105" src={studentCollaboration} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
          <div className="grid gap-lg">
            <article className="rounded-3xl border border-hairline bg-canvas p-xl shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Product proof
              </p>
              <h2 className="font-display text-4xl font-bold leading-tight text-ink mb-6">A dashboard that tells the student what to do next.</h2>
              <p className="text-lg leading-relaxed text-body">
                The home screen leads with match confidence, then immediately shows roadmap progress, priority skill gaps, resume score, and the next best action.
              </p>
            </article>
            <div className="rounded-3xl border border-hairline bg-canvas p-xl shadow-sm">
              <MatchCompass label="Frontend Development" score={87} status="Strong match" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Storytelling Section */}
      <section className="mx-auto max-w-[1280px] px-lg py-24" id="features">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="font-display text-5xl font-extrabold leading-tight mb-6">Everything has a place in the plan.</h2>
          <p className="text-xl leading-relaxed text-body">
            Each step below is paired with a visual card so the landing page reads like a guided product story, not a list.
          </p>
        </div>
        <div className="flex flex-col gap-8">
          {featureStories.map(([title, description, imageSrc], index) => (
            <FeatureStory description={description} index={index} key={title} imageSrc={imageSrc} title={title} />
          ))}
        </div>
      </section>

      {/* Full Roadmap Loaded & Proof Cards Section */}
      <section className="mx-auto max-w-[1280px] px-lg py-24 border-t border-hairline">
        <div className="grid gap-xl lg:grid-cols-[1fr_1fr] items-start">
          <article className="rounded-3xl border border-hairline bg-canvas p-xl shadow-lg sticky top-24">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Full roadmap loaded</p>
            <h2 className="font-display text-4xl font-bold leading-tight text-ink mb-6">No scattered advice. One ordered plan from foundation to job-ready.</h2>
            <p className="text-lg leading-relaxed text-body mb-10">
              CareerSpark keeps the student inside one calm workspace where assessment, roadmap, resume, internships, and interview practice reinforce the same goal.
            </p>
            <div className="overflow-hidden rounded-2xl border border-hairline shadow-inner">
              <img alt="Student reviewing a personal career plan on a laptop" className="h-72 w-full object-cover transition-transform duration-700 hover:scale-105" src={studentLogin} />
            </div>
          </article>
          <div className="grid gap-6 sm:grid-cols-2">
            {proofCards.map(([Icon, title, description]) => (
              <ProofCard description={description} Icon={Icon} key={title} title={title} />
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-canvas border-t border-hairline" id="workflow">
        <div className="mx-auto max-w-[1280px] px-lg py-24">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <h2 className="font-display text-5xl font-extrabold leading-tight text-ink mb-6">Get CareerSpark on every workflow.</h2>
              <p className="text-lg leading-relaxed text-body">Start on the web app, download your roadmap as a PDF, and keep the floating assistant available across every dashboard screen.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {workflowCards.map(([Icon, title, description]) => (
                <ProofCard description={description} Icon={Icon} key={title} title={title} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white">
        <div className="mx-auto grid max-w-[1280px] gap-16 px-lg py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-display text-5xl font-bold tracking-tight">CareerSpark</p>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">A career workspace that turns Class-12 uncertainty into a visible next action.</p>
            <div className="mt-10 flex gap-8 text-base font-medium text-muted">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#roadmap-proof" className="hover:text-white transition-colors">Roadmap</a>
              <a href="/login" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-surface-dark-elevated bg-surface-dark-elevated">
              <img alt="Students planning a career roadmap together" className="h-[300px] w-full object-cover opacity-80 transition-opacity hover:opacity-100" src={studentCollaboration} />
            </div>
            <div className="rounded-3xl border border-surface-dark-elevated bg-surface-dark-elevated p-10 flex flex-col justify-center">
              <Sparkles aria-hidden="true" className="text-primary w-8 h-8 mb-6" />
              <p className="font-display text-3xl font-bold leading-tight">One plan. Clear progress. Better applications.</p>
              <div className="mt-8 space-y-4">
                {['Assessment saved', 'Roadmap ready', 'Resume score tracked'].map((item) => (
                  <p className="flex items-center gap-4 text-base text-muted" key={item}>
                    <CheckCircle2 aria-hidden="true" className="text-success w-5 h-5" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Landing
