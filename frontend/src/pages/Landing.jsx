import { useState } from 'react'
import { 
  ArrowRight, Bot, BriefcaseBusiness, CheckCircle2, FileScan, Map, Mic, 
  Search, ShieldCheck, Sparkles, Star, Award, TrendingUp, Users, Zap, 
  Play, ChevronRight, BookmarkCheck, Check, Compass, Cpu, Layers, Target 
} from 'lucide-react'
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

// Official Industry Partners & Proctored Certification Brands for Rolling Logo Bar
const OFFICIAL_INDUSTRY_LOGOS = [
  { name: 'Amazon AWS', domain: 'aws.amazon.com', color: '#FF9900' },
  { name: 'Google Cloud', domain: 'cloud.google.com', color: '#4285F4' },
  { name: 'Microsoft Azure', domain: 'azure.microsoft.com', color: '#0078D4' },
  { name: 'Salesforce', domain: 'salesforce.com', color: '#00A1E0' },
  { name: 'Databricks', domain: 'databricks.com', color: '#FF3621' },
  { name: 'TCS iON', domain: 'tcs.com', color: '#16A34A' },
  { name: 'LinkedIn Learning', domain: 'linkedin.com', color: '#0A66C2' },
  { name: 'GitHub', domain: 'github.com', color: '#24292E' },
  { name: 'Docker', domain: 'docker.com', color: '#2496ED' },
  { name: 'MongoDB', domain: 'mongodb.com', color: '#47A248' },
  { name: 'IBM Cloud', domain: 'ibm.com', color: '#052FAD' },
  { name: 'Cisco', domain: 'cisco.com', color: '#1BA0D7' },
  { name: 'Oracle', domain: 'oracle.com', color: '#F80000' },
  { name: 'Red Hat', domain: 'redhat.com', color: '#EE0000' },
  { name: 'Meta', domain: 'meta.com', color: '#0668E1' },
]

function Landing() {
  return (
    <main className="min-h-screen bg-page-warm text-ink font-sans selection:bg-primary/20 overflow-x-hidden">
      <PublicNav />

      {/* 2. Hero Section (Clause Reference Image Inspired: Centered, Grid Background, Underline Highlight & Floating Pointers) */}
      <section 
        className="relative pt-12 pb-20 md:pt-20 md:pb-24 border-b border-hairline overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(100, 116, 139, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      >
        {/* Subtle radial glow in the center */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-primary/10 via-[#4ADE80]/10 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

        <div className="mx-auto max-w-[1200px] px-lg text-center relative z-10">
          
          {/* Centered Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink shadow-sm mb-8 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-[#16A34A] fill-[#16A34A]" />
            BUILT FOR INFOSYS SPRINGBOARD
          </div>

          {/* Clause-Style Centered Headline (Two lines, refined font size, medium weight, sans font style) */}
          <h1 className="font-sans text-3xl sm:text-5xl lg:text-[56px] font-medium leading-[1.18] tracking-normal text-ink max-w-4xl mx-auto mb-8 relative">
            One workspace to{' '}
            <span className="relative inline-block text-ink">
              accelerate
              {/* Clause Reference Style Lime-Green Underline Highlight */}
              <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-2.5 sm:h-4 bg-[#4ADE80]/80 -z-10 rounded-md transform -rotate-1"></span>
            </span>
            <br className="hidden sm:inline" />{' '}
            your tech career and roadmap.
          </h1>

          {/* Centered Narrative Description */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed text-body mb-12">
            CareerSpark helps Class-12 and college students work faster, smarter, and more efficiently—delivering AI career intelligence, proctored industry certifications, and ATS resume scoring in one calm plan.
          </p>

          {/* Centered CTA Buttons (Clause Style: Dark Green Pill + White Outline Pill) */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-16">
            <Button to="/register" className="bg-[#0B2518] text-white hover:bg-primary shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all px-9 py-4 rounded-full text-base font-bold flex items-center gap-3 border border-[#164E31]">
              Start for Free
              <ArrowRight aria-hidden="true" className="w-5 h-5 text-[#4ADE80]" />
            </Button>
            <Button href="#features" variant="secondary" className="bg-canvas border border-hairline hover:bg-surface-soft shadow-md px-8 py-4 rounded-full text-base font-bold text-ink flex items-center gap-2">
              Get a Demo
            </Button>
          </div>

          {/* Floating Avatars with Inward Arrows (The Signature Clause Design Pointers!) */}
          
          {/* Top-Left Avatar Pointer */}
          <div className="hidden xl:flex absolute top-4 left-6 2xl:-left-4 items-center gap-3 animate-float pointer-events-none">
            <div className="relative">
              <img className="h-14 w-14 rounded-full ring-4 ring-purple-500/20 shadow-lg object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Student" />
              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-1 rounded-full shadow">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
            {/* Arrow pointing down-right toward center title */}
            <div className="flex items-center gap-1.5 bg-canvas/95 px-3 py-1.5 rounded-xl border border-hairline shadow-md text-left">
              <div>
                <p className="text-[10px] font-mono uppercase font-bold text-muted">Student Roadmap</p>
                <p className="text-xs font-bold text-ink">Frontend Ready 🎯</p>
              </div>
              <svg className="w-5 h-5 text-[#0B2518] transform rotate-45 fill-current" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
            </div>
          </div>

          {/* Top-Right Avatar Pointer */}
          <div className="hidden xl:flex absolute top-6 right-6 2xl:-right-4 items-center gap-3 animate-float pointer-events-none flex-row-reverse" style={{ animationDelay: '1s' }}>
            <div className="relative">
              <img className="h-14 w-14 rounded-full ring-4 ring-blue-500/20 shadow-lg object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Mentor" />
              <div className="absolute -bottom-1 -left-1 bg-blue-600 text-white p-1 rounded-full shadow">
                <Check className="w-3 h-3" />
              </div>
            </div>
            {/* Arrow pointing down-left toward center title */}
            <div className="flex items-center gap-1.5 bg-canvas/95 px-3 py-1.5 rounded-xl border border-hairline shadow-md text-right flex-row-reverse">
              <div>
                <p className="text-[10px] font-mono uppercase font-bold text-muted">AI Resume Analyzer</p>
                <p className="text-xs font-bold text-success">ATS Score: 94/100 ⚡</p>
              </div>
              <svg className="w-5 h-5 text-[#0B2518] transform rotate-[135deg] fill-current" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
            </div>
          </div>

          {/* Bottom-Left Avatar Pointer */}
          <div className="hidden xl:flex absolute bottom-24 left-10 2xl:left-0 items-center gap-3 animate-float pointer-events-none" style={{ animationDelay: '1.8s' }}>
            <div className="relative">
              <img className="h-14 w-14 rounded-full ring-4 ring-emerald-500/20 shadow-lg object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Intern" />
              <div className="absolute -top-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow">
                <Award className="w-3 h-3" />
              </div>
            </div>
            {/* Arrow pointing up-right toward center title */}
            <div className="flex items-center gap-1.5 bg-canvas/95 px-3 py-1.5 rounded-xl border border-hairline shadow-md text-left">
              <div>
                <p className="text-[10px] font-mono uppercase font-bold text-muted">1-Click Pipeline</p>
                <p className="text-xs font-bold text-ink">AWS Cloud Cert 🏆</p>
              </div>
              <svg className="w-5 h-5 text-[#0B2518] transform -rotate-45 fill-current" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
            </div>
          </div>

          {/* Bottom-Right Avatar Pointer */}
          <div className="hidden xl:flex absolute bottom-24 right-10 2xl:right-0 items-center gap-3 animate-float pointer-events-none flex-row-reverse" style={{ animationDelay: '0.5s' }}>
            <div className="relative">
              <img className="h-14 w-14 rounded-full ring-4 ring-amber-500/20 shadow-lg object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" alt="Engineer" />
              <div className="absolute -top-1 -left-1 bg-amber-600 text-white p-1 rounded-full shadow">
                <Mic className="w-3 h-3" />
              </div>
            </div>
            {/* Arrow pointing up-left toward center title */}
            <div className="flex items-center gap-1.5 bg-canvas/95 px-3 py-1.5 rounded-xl border border-hairline shadow-md text-right flex-row-reverse">
              <div>
                <p className="text-[10px] font-mono uppercase font-bold text-muted">Voice AI Mentor</p>
                <p className="text-xs font-bold text-ink">Interview Passed ✅</p>
              </div>
              <svg className="w-5 h-5 text-[#0B2518] transform -rotate-[135deg] fill-current" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
            </div>
          </div>

        </div>

        {/* 3. Rolling Official Industry Logos Strip Below Hero (Matching Clause Partner Bar) */}
        <div className="mt-8 pt-8 border-t border-hairline/80 bg-canvas/70 backdrop-blur-md">
          <div className="mx-auto max-w-[1280px] px-lg">
            
            {/* Continuous Marquee Rolling Official Logos */}
            <div className="overflow-hidden relative w-full">
              <div className="animate-marquee flex items-center gap-12 whitespace-nowrap py-2">
                {OFFICIAL_INDUSTRY_LOGOS.concat(OFFICIAL_INDUSTRY_LOGOS).map((company, idx) => (
                  <div key={`${company.name}-${idx}`} className="flex items-center gap-3.5 group cursor-default transition-all hover:scale-105">
                    <div className="w-9 h-9 rounded-xl bg-canvas border border-hairline shadow-sm flex items-center justify-center p-1.5 group-hover:border-primary/50 transition-colors">
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`} 
                        alt={`${company.name} official logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentNode.innerHTML = `<span class="font-bold text-xs" style="color: ${company.color}">${company.name.slice(0, 2).toUpperCase()}</span>`
                        }}
                      />
                    </div>
                    <span className="font-display font-bold text-base sm:text-lg text-body group-hover:text-ink transition-colors tracking-tight">
                      {company.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Interactive Progress & Stats Bar Section */}
      <section className="mx-auto max-w-[1280px] px-lg py-24" id="roadmap-proof">
        <div className="bg-canvas rounded-3xl border border-hairline p-8 md:p-14 shadow-sm mb-16">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left Box: Story */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full mb-4 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                Proven Results, Real Impact
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink leading-tight mb-6">
                Structured Mentorship Over Noisy Job Boards.
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-body mb-8">
                Traditional job boards overload students with endless listings and generic advice. CareerSpark uses AI to filter the noise, giving you exact skill targets, ATS resume scoring, and proctored certifications tailored to your target role.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-bold text-ink">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>100% Student-Owned Data</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-ink">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Infosys Vetted</span>
                </div>
              </div>
            </div>

            {/* Right Box: Interactive Progress Sliders */}
            <div className="space-y-7 bg-page-warm/60 p-6 sm:p-8 rounded-2xl border border-hairline/80 shadow-inner">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-bold text-ink font-display flex items-center gap-2">
                    <Compass className="w-4 h-4 text-primary" /> Career Readiness & Roadmap Progress
                  </span>
                  <span className="text-sm font-bold font-mono text-primary">88%</span>
                </div>
                <div className="w-full bg-surface-strong h-3 rounded-full relative overflow-visible">
                  <div className="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full w-[88%] relative transition-all duration-1000">
                    <div className="absolute -right-2 -top-1.5 h-6 w-6 rounded-full bg-white border-2 border-primary shadow-md"></div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-bold text-ink font-display flex items-center gap-2">
                    <FileScan className="w-4 h-4 text-success" /> ATS Resume Match & Keyword Optimization
                  </span>
                  <span className="text-sm font-bold font-mono text-success">95%</span>
                </div>
                <div className="w-full bg-surface-strong h-3 rounded-full relative overflow-visible">
                  <div className="bg-gradient-to-r from-emerald-500 to-success h-full rounded-full w-[95%] relative transition-all duration-1000">
                    <div className="absolute -right-2 -top-1.5 h-6 w-6 rounded-full bg-white border-2 border-success shadow-md"></div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-bold text-ink font-display flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" /> Proctored Certification Pipeline Tracking
                  </span>
                  <span className="text-sm font-bold font-mono text-amber-600">92%</span>
                </div>
                <div className="w-full bg-surface-strong h-3 rounded-full relative overflow-visible">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full w-[92%] relative transition-all duration-1000">
                    <div className="absolute -right-2 -top-1.5 h-6 w-6 rounded-full bg-white border-2 border-amber-500 shadow-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Animated Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="bg-canvas p-8 rounded-2xl border border-hairline shadow-sm hover:border-primary/40 transition-all">
            <p className="font-display text-4xl sm:text-5xl font-extrabold text-ink mb-2">10k<span className="text-primary">+</span></p>
            <p className="text-sm sm:text-base font-semibold text-body">Student Roadmaps Built</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-success bg-success/10 px-2.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> 100% Active
            </div>
          </div>

          <div className="bg-canvas p-8 rounded-2xl border border-hairline shadow-sm hover:border-primary/40 transition-all">
            <p className="font-display text-4xl sm:text-5xl font-extrabold text-ink mb-2">500<span className="text-[#10B981]">+</span></p>
            <p className="text-sm sm:text-base font-semibold text-body">Curated Tech Internships</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Beginner Vetted
            </div>
          </div>

          <div className="bg-canvas p-8 rounded-2xl border border-hairline shadow-sm hover:border-primary/40 transition-all">
            <p className="font-display text-4xl sm:text-5xl font-extrabold text-ink mb-2">30<span className="text-amber-500">+</span></p>
            <p className="text-sm sm:text-base font-semibold text-body">Official Proctored Certs</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              <Award className="w-3 h-3" /> AWS, GCP & Azure
            </div>
          </div>

          <div className="bg-canvas p-8 rounded-2xl border border-hairline shadow-sm hover:border-primary/40 transition-all">
            <p className="font-display text-4xl sm:text-5xl font-extrabold text-ink mb-2">24/7<span className="text-indigo-500">⚡</span></p>
            <p className="text-sm sm:text-base font-semibold text-body">AI Career Mentor Support</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-indigo-600 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
              <Bot className="w-3 h-3" /> Real-Time RAG
            </div>
          </div>
        </div>
      </section>

      {/* 5. "Everything Your Career Needs" Bento Grid */}
      <section className="mx-auto max-w-[1280px] px-lg py-20 border-t border-hairline" id="features">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full mb-4 font-mono">
            <Layers className="w-3.5 h-3.5" />
            Bento Grid Storytelling
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold leading-tight text-ink mb-6">
            Everything Your Career Needs to Learn & Work Smarter.
          </h2>
          <p className="text-lg sm:text-xl leading-relaxed text-body">
            From task tracking to speech mock interviews, our workspace features are built to keep your career goals organized, verified, and moving forward.
          </p>
        </div>

        {/* Asymmetrical Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 bg-canvas rounded-3xl border border-hairline p-8 sm:p-10 shadow-sm flex flex-col justify-between overflow-hidden relative group hover:shadow-md transition-all">
            <div className="max-w-xl z-10 mb-8">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-mono text-xs font-bold rounded-lg uppercase tracking-wider mb-4">
                90-Day Roadmap
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-3">
                Step-by-Step Learning Timeline
              </h3>
              <p className="text-base text-body leading-relaxed">
                We order your skills, courses, certifications, and internship applications into a calm, day-by-day 90-day execution plan. No scattered spreadsheets or generic advice.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-hairline shadow-inner max-h-[300px]">
              <img 
                alt="90 Day Roadmap Feature" 
                src={roadmapFeature} 
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </div>

          <div className="bg-canvas rounded-3xl border border-hairline p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <span className="inline-block px-3 py-1 bg-success/10 text-success font-mono text-xs font-bold rounded-lg uppercase tracking-wider mb-4">
                AI Match Compass
              </span>
              <h3 className="font-display text-2xl font-bold text-ink mb-3">
                Instant Career Fit Score
              </h3>
              <p className="text-sm text-body leading-relaxed mb-8">
                Take a 15-minute practical assessment and compare 1-3 career paths with deep match confidence and skill gap analysis before committing.
              </p>
            </div>
            <div className="mt-auto bg-page-warm/80 p-5 rounded-2xl border border-hairline">
              <MatchCompass label="Full Stack Web Dev" score={91} status="Prime Match" />
            </div>
          </div>

          <div className="bg-canvas rounded-3xl border border-hairline p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-600 font-mono text-xs font-bold rounded-lg uppercase tracking-wider mb-4">
                Voice AI Mentor
              </span>
              <h3 className="font-display text-2xl font-bold text-ink mb-3">
                Speech Mock Interviews
              </h3>
              <p className="text-sm text-body leading-relaxed mb-6">
                Practice real technical and HR interview questions with speech recognition. Get instant AI feedback on clarity, tone, and technical keywords.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-hairline max-h-[220px]">
              <img 
                alt="Interview Feature" 
                src={interviewFeature} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </div>

          <div className="md:col-span-2 bg-gradient-to-br from-[#0B1E14] via-[#0D281A] to-ink text-white rounded-3xl border border-[#164E31] p-8 sm:p-10 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#10B981]/15 rounded-full blur-3xl -z-0"></div>
            
            <div className="max-w-xl z-10 mb-8">
              <span className="inline-block px-3 py-1 bg-[#4ADE80]/20 text-[#4ADE80] font-mono text-xs font-bold rounded-lg uppercase tracking-wider mb-4 border border-[#4ADE80]/30">
                Verified Opportunities
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                30+ Official Proctored Certs & Real Tech Internships
              </h3>
              <p className="text-base text-gray-300 leading-relaxed">
                We don't show generic icons or unverified links. Pull real official certifications from AWS, Google, Microsoft Azure, Databricks, and beginner-friendly internships with 1-click pipeline tracking.
              </p>
            </div>

            <div className="z-10 pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-wider font-mono text-[#4ADE80] mb-3 font-semibold">Supported Official Ecosystems:</p>
              <div className="flex flex-wrap gap-2.5">
                {OFFICIAL_INDUSTRY_LOGOS.slice(0, 7).map((provider) => (
                  <span 
                    key={provider.name} 
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-transform hover:scale-105 bg-white/10 text-white border-white/20"
                  >
                    {provider.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. "How It Works" 3-Step Guided Journey */}
      <section className="bg-canvas border-t border-hairline py-24" id="workflow">
        <div className="mx-auto max-w-[1280px] px-lg">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block mb-2">Simple 3-Step Process</span>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-ink">From Class-12 Uncertainty to Internship Ready.</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            <div className="bg-page-warm/60 p-8 rounded-3xl border border-hairline relative group hover:border-primary/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-primary text-white font-display font-bold text-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-3">Assess Your DNA</h3>
              <p className="text-body leading-relaxed text-sm">
                Complete a 15-minute scenario assessment. Our AI evaluates your analytical, creative, and technical inclinations to suggest your top 3 career fits.
              </p>
            </div>

            <div className="bg-page-warm/60 p-8 rounded-3xl border border-hairline relative group hover:border-primary/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-[#10B981] text-white font-display font-bold text-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-3">Execute 90-Day Plan</h3>
              <p className="text-body leading-relaxed text-sm">
                Follow your customized day-by-day learning roadmap. Complete free vendor courses, track official proctored certifications, and build verified projects.
              </p>
            </div>

            <div className="bg-page-warm/60 p-8 rounded-3xl border border-hairline relative group hover:border-primary/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white font-display font-bold text-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-3">Land Your Internship</h3>
              <p className="text-body leading-relaxed text-sm">
                Run your resume through our ATS Analyzer for instant 90+ optimization, practice speech interviews with our AI, and apply directly to vetted beginner drives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final High-Impact CTA Banner & Footer */}
      <section className="mx-auto max-w-[1280px] px-lg py-16">
        <div className="bg-gradient-to-r from-ink via-[#0B1E14] to-ink text-white rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#10B981]/20 rounded-full blur-3xl -z-0"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 bg-[#4ADE80]/20 text-[#4ADE80] font-mono text-xs font-bold rounded-full uppercase tracking-wider mb-6 border border-[#4ADE80]/30">
              🚀 Built for Infosys Springboard 2026
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
              Ready to sort your next 90 days into one career plan?
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Join thousands of Class-12 and college students building real-world skills, earning verified certifications, and securing tech internships with AI guidance.
            </p>
            <div className="flex justify-center">
              <Button to="/register" className="bg-[#4ADE80] text-[#0B1E14] hover:bg-white shadow-xl hover:scale-105 transition-all px-10 py-4 rounded-full text-base font-extrabold">
                Start Your Free Roadmap Now ➔
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-lg py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-center justify-between">
            <div>
              <p className="font-display text-4xl font-bold tracking-tight text-white mb-3">CareerSpark</p>
              <p className="max-w-md text-base leading-relaxed text-gray-400 mb-6">
                A next-generation AI career workspace that turns academic uncertainty into a visible, proctored 90-day execution roadmap.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs text-gray-300 font-mono">
                <span>🌟 Internship Project:</span>
                <strong className="text-[#4ADE80]">Infosys Springboard 4.0</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 sm:justify-end text-sm text-gray-400 font-medium">
              <div className="flex flex-col gap-3">
                <span className="text-white font-bold uppercase text-xs tracking-wider font-mono">Workspace</span>
                <a href="#features" className="hover:text-white transition-colors">Bento Features</a>
                <a href="#roadmap-proof" className="hover:text-white transition-colors">AI Match Compass</a>
                <a href="#workflow" className="hover:text-white transition-colors">3-Step Process</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-white font-bold uppercase text-xs tracking-wider font-mono">Opportunities</span>
                <a href="/register" className="hover:text-white transition-colors">Verified Internships</a>
                <a href="/register" className="hover:text-white transition-colors">Proctored Certifications</a>
                <a href="/login" className="hover:text-white transition-colors">Student Login</a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
            <p>© 2026 CareerSpark. All rights reserved. Powered by Supabase & Vite.</p>
            <p className="mt-2 sm:mt-0">Designed with precision for Infosys Springboard Evaluators.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Landing
