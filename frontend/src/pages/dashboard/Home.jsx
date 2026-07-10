/*
 * Home renders the dashboard overview with premium metric cards and visual storytelling.
 * It exists as the student launchpad for roadmap, gaps, certifications, resume, and next action.
 */
import { ArrowRight, Award, BookOpen, BriefcaseBusiness, FileText, Map, Target, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MatchCompass from '../../components/ui/MatchCompass.jsx'
import { careerPaths, roadmapPhases } from '../../data/sampleData.js'
import { loadCertifications, loadLatestAssessment, loadProfile, loadResumeVersions, loadRoadmap, loadSkillProgress, subscribeToUserTable, saveRoadmapChoice } from '../../services/supabaseData.js'
import { fetchDashboardAnalysis, generateRoadmap } from '../../services/apiClient.js'
import { getTargetRole, buildDashboardPayload, buildHiringAnalysis } from '../../services/careerAnalysis.js'

// Reads the selected career path and returns a safe fallback path.
function getSelectedPath() {
  return JSON.parse(localStorage.getItem('careerspark_path') || 'null') || careerPaths[0]
}

// Renders a premium metric card.
function MetricCard({ icon: Icon, label, value, caption, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary/10 to-primary/5 border-primary/20 text-primary',
    success: 'from-green-50 to-green-50/50 border-green-200 text-green-600',
    warning: 'from-amber-50 to-amber-50/50 border-amber-200 text-amber-600',
    info: 'from-blue-50 to-blue-50/50 border-blue-200 text-blue-600',
    purple: 'from-purple-50 to-purple-50/50 border-purple-200 text-purple-600',
  }
  const classes = colorMap[color] || colorMap.primary
  return (
    <article className={`group rounded-2xl border bg-gradient-to-br p-lg transition-all hover:-translate-y-0.5 hover:shadow-md ${classes}`}>
      <div className="flex items-center justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl bg-white/80 shadow-sm`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <TrendingUp size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />
      </div>
      <p className="mt-lg font-mono text-[32px] font-bold text-ink leading-none">{value}</p>
      <p className="mt-sm text-sm font-semibold text-ink">{label}</p>
      <p className="mt-xs text-xs text-body">{caption}</p>
    </article>
  )
}

// Renders dashboard home and returns metric cards in priority order.
function Home() {
  const [path, setPath] = useState(getSelectedPath())
  const [skillRows, setSkillRows] = useState([])
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [certifications, setCertifications] = useState([])
  const [resumeRows, setResumeRows] = useState([])
  // Reads cache to instantly show analytics if available
  const [analysis, setAnalysis] = useState(() => {
    try {
      const cached = localStorage.getItem('careerspark_dashboard_analysis')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [isAnalyzing, setIsAnalyzing] = useState(!analysis)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const targetRole = getTargetRole(profile, roadmap, path)

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const payload = {
        career_path: path.title,
        current_skills: profile?.skills || [],
        experience: profile?.experience_items || [],
        goal_note: profile?.goal_note || ''
      }
      const aiResponse = await generateRoadmap(payload)
      const phasesToSave = aiResponse?.phases || roadmapPhases
      await saveRoadmapChoice(path, phasesToSave)
      setRoadmap({ career_path: path.title, phases: phasesToSave })
      
      const newDashboardPayload = buildDashboardPayload(profile, { path, phases: phasesToSave }, resumeRows)
      const newAnalysis = await fetchDashboardAnalysis(newDashboardPayload, true)
      setAnalysis(newAnalysis)
      localStorage.setItem('careerspark_dashboard_analysis', JSON.stringify(newAnalysis))
    } catch (err) {
      console.error("Regeneration failed:", err)
      setAnalysis({ error: err.message || "Failed to regenerate insights." })
    } finally {
      setIsRegenerating(false)
    }
  }

  useEffect(() => {
    let unsubscribe = () => {}
    
    // Load all static data first
    Promise.all([
      loadProfile(),
      loadRoadmap(),
      loadLatestAssessment(),
      loadSkillProgress(),
      loadCertifications(),
      loadResumeVersions()
    ]).then(async ([prof, rdmp, assess, skills, certs, resumes]) => {
      if (prof) setProfile(prof)
      if (rdmp) {
        setRoadmap(rdmp)
        if (rdmp.career_path) setPath({ ...getSelectedPath(), title: rdmp.career_path, summary: `Roadmap personalized from your profile, skills, projects, and current course.` })
      }
      if (assess?.results?.[0]) setPath(assess.results[0])
      if (skills?.length) setSkillRows(skills)
      if (certs?.length) setCertifications(certs)
      if (resumes?.length) setResumeRows(resumes)

      // Only run analysis if we have a basic profile or a target path
      try {
        const aiAnalysis = await fetchDashboardAnalysis(buildDashboardPayload(prof, rdmp, resumes))
        setAnalysis(aiAnalysis)
        localStorage.setItem('careerspark_dashboard_analysis', JSON.stringify(aiAnalysis))
      } catch (err) {
        console.error("AI Analysis failed:", err)
        // If AI is unavailable, we don't fall back to mock data. We just let the UI show an error state.
        setAnalysis({ error: err.message || "AI Reasoning Engine is currently unavailable." })
      } finally {
        setIsAnalyzing(false)
      }
    }).catch(err => {
      console.error("Data load failed:", err)
      setIsAnalyzing(false)
    })

    subscribeToUserTable('skill_progress', () => {
      loadSkillProgress().then((rows) => rows.length && setSkillRows(rows)).catch(() => {})
    }).then((cleanup) => {
      unsubscribe = cleanup
    })
    return () => unsubscribe()
  }, [])

  const completedSkills = (analysis?.gaps || []).filter((item) => item.current >= item.target).length
  const totalSkills = analysis?.gaps?.length || 0
  const roadmapProgress = (roadmap?.progress_percent ?? Math.round((completedSkills / Math.max(1, totalSkills)) * 100)) || 0
  const completedCertifications = certifications.filter((item) => item.status === 'completed').length
  const applicationCount = Array.isArray(profile?.applications) ? profile.applications.length : 0
  const activePhases = Array.isArray(roadmap?.phases) && roadmap.phases.length ? roadmap.phases : (profile ? [] : roadmapPhases)

  return (
    <div className="space-y-xl">
      {/* Hero Card */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas via-canvas to-primary/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative grid gap-lg lg:grid-cols-[280px_1fr] lg:items-center">
          <MatchCompass label={targetRole} score={analysis?.readinessScore ?? path.match} status="Career Match Score" />
          <div>
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-4">
              <Target size={14} />
              Hiring readiness
            </div>
            {isAnalyzing && !analysis ? (
              <div className="animate-pulse">
                <div className="h-8 w-3/4 rounded bg-surface-strong mb-4"></div>
                <div className="h-4 w-full rounded bg-surface-strong mb-2"></div>
                <div className="h-4 w-2/3 rounded bg-surface-strong mb-6"></div>
              </div>
            ) : (
              <>
                <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight">Target role: {targetRole}</h2>
                <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body">CareerSpark reads your profile, resume, projects, skills, and roadmap as shortlisting signals. The score is a practical readiness estimate for this target.</p>
              </>
            )}
            <div className="mt-lg flex flex-wrap gap-sm">
              <Link className="inline-flex h-11 items-center gap-sm rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-primary shadow-md hover:shadow-lg transition-all" to="/dashboard/skills">
                <Zap size={16} /> Fix top gaps
              </Link>
              <Link className="inline-flex h-11 items-center gap-sm rounded-xl border border-hairline bg-canvas px-6 text-sm font-semibold text-ink hover:bg-surface-soft transition-all" to="/dashboard/courses">
                <BookOpen size={16} /> Find courses
              </Link>
              <button 
                onClick={handleRegenerate}
                disabled={isRegenerating || isAnalyzing}
                className="inline-flex h-11 items-center gap-sm rounded-xl border border-hairline bg-canvas px-6 text-sm font-semibold text-ink hover:bg-surface-soft transition-all disabled:opacity-50"
              >
                {isRegenerating ? <span className="animate-pulse">Regenerating...</span> : <><Zap size={16} className="text-primary" /> Regenerate AI Insights</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid gap-lg md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Map} label="Roadmap Progress" value={`${roadmapProgress}%`} caption={roadmap?.career_path || 'Complete your profile roadmap'} color="primary" />
        <MetricCard icon={Target} label="Skills Completed" value={`${completedSkills}/${totalSkills}`} caption="From profile skill gaps" color="success" />
        <MetricCard icon={Award} label="Certs Earned" value={`${completedCertifications}`} caption="Tracked from certifications" color="purple" />
        <MetricCard icon={FileText} label="Resume Score" value={analysis?.resumeScore ?? '—'} caption={analysis?.resumeScore ? 'Latest analysis' : 'Upload to score'} color="warning" />
        <MetricCard icon={BriefcaseBusiness} label="Applications" value={`${applicationCount}`} caption="From your profile" color="info" />
      </section>

      {/* Skill Gaps + Diagnosis */}
      <section className="grid gap-lg lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm flex flex-col h-[440px]">
          <div className="flex items-center gap-sm mb-lg shrink-0">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Target size={20} /></div>
            <h2 className="font-display text-xl font-bold">Skill Gap Snapshot</h2>
          </div>
          {isAnalyzing && !analysis ? (
            <div className="space-y-4 animate-pulse flex-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2"><div className="h-4 w-24 bg-surface-strong rounded"></div><div className="h-4 w-12 bg-surface-strong rounded"></div></div>
                  <div className="h-2.5 rounded-full bg-surface-strong"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-base flex-1 overflow-y-auto pr-2 min-h-0 mb-4 custom-scrollbar">
                {analysis?.gaps?.map((item) => (
                  <div key={item.skill}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{item.skill}</span>
                      <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${item.priority === 'Critical' ? 'bg-red-50 text-red-600' : item.priority === 'Important' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>{item.priority}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-surface-strong overflow-hidden">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-700" style={{ width: `${Math.min(100, item.current)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-sm border-t border-hairline flex items-center justify-between shrink-0">
                <p className="text-xs text-muted flex-1">Update your skills to track progress.</p>
                <Link to="/dashboard/skills" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                  View Skill Matrix <ArrowRight size={14} />
                </Link>
              </div>
            </>
          )}
        </article>
        <article className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm flex flex-col h-[440px]">
          <div className="flex items-center gap-sm mb-lg shrink-0">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-600"><TrendingUp size={20} /></div>
            <h2 className="font-display text-xl font-bold">Shortlisting Diagnosis</h2>
          </div>
          {isAnalyzing && !analysis ? (
            <div className="space-y-3 animate-pulse">
               {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="h-10 w-full bg-surface-strong rounded-xl"></div>
               ))}
            </div>
          ) : (
            <div className="space-y-sm flex-1 overflow-y-auto pr-2 min-h-0 custom-scrollbar">
              {analysis?.strongestSignals?.map((item) => (
                <p className="flex items-start gap-sm rounded-xl bg-green-50/50 p-sm text-sm text-body border border-green-100" key={item}>
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-green-500 shrink-0"></span>{item}
                </p>
              ))}
              {analysis?.riskSignals?.map((item) => (
                <p className="flex items-start gap-sm rounded-xl bg-amber-50/50 p-sm text-sm text-body border border-amber-100" key={item}>
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>{item}
                </p>
              ))}
              {analysis?.nextActions?.map((item) => (
                <p className="flex items-start gap-sm rounded-xl bg-blue-50/50 p-sm text-sm text-body border border-blue-100" key={item}>
                  <ArrowRight size={14} className="mt-0.5 text-primary shrink-0" />{item}
                </p>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* Roadmap Phase Stepper */}
      {activePhases.length > 0 ? (
        <section className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm">
          <div className="flex items-center gap-sm mb-lg">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600"><Map size={20} /></div>
            <h2 className="font-display text-xl font-bold">Roadmap Phase Stepper</h2>
          </div>
          <div className="grid gap-lg lg:grid-cols-3">
            {activePhases.map((phase, index) => (
              <article className="group rounded-2xl border border-hairline p-lg hover:border-primary/30 hover:shadow-md transition-all" key={phase.title}>
                <div className="flex items-center gap-sm mb-base">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary text-sm font-bold">{index + 1}</span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{phase.timeline}</span>
                </div>
                <p className="font-display text-lg font-bold">{phase.title}</p>
                <p className="mt-sm text-sm leading-relaxed text-body">{phase.outcome}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      
      {/* AI Error Notification Overlay (if failed) */}
      {analysis?.error && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-lg z-50">
          <h4 className="font-bold mb-1">AI Reasoning Error</h4>
          <p className="text-sm">{analysis.error}</p>
        </div>
      )}
    </div>
  )
}

export default Home
