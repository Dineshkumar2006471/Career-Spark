/*
 * Skills renders the skill gap analyzer with visual progress indicators.
 * It exists to compare current skills against target role requirements.
 */
import { Trophy, ChevronRight, Zap, Target, Wrench, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchDashboardAnalysis } from '../../services/apiClient.js'
import { loadProfile, loadResumeVersions, loadRoadmap, loadSkillProgress, saveSkillProgress } from '../../services/supabaseData.js'
import { getTargetSkills, getTargetRole, buildDashboardPayload, buildSkillGaps, buildLearningResources, buildHiringAnalysis } from '../../services/careerAnalysis.js'
import { Link } from 'react-router-dom'

// Renders skill gaps and returns prioritized learning recommendations.
function Skills() {
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [items, setItems] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    Promise.all([
      loadProfile(),
      loadRoadmap(),
      loadSkillProgress(),
      loadResumeVersions()
    ]).then(async ([prof, rdmp, skills, resumes]) => {
      if (prof) setProfile(prof)
      if (rdmp) setRoadmap(rdmp)
      if (skills?.length) setItems(skills)
      
      try {
        const aiAnalysis = await fetchDashboardAnalysis(buildDashboardPayload(prof, rdmp, resumes))
        setAnalysis(aiAnalysis)
      } catch (err) {
        console.error("AI Analysis failed, using local fallback:", err)
        // Build local fallback analysis from profile data
        const fallbackPath = JSON.parse(localStorage.getItem('careerspark_path') || 'null') || { title: 'Frontend Development' }
        const targetRole = getTargetRole(prof, rdmp, fallbackPath)
        const gaps = buildSkillGaps(prof, skills, targetRole)
        const courses = buildLearningResources(targetRole, gaps)
        const localAnalysis = buildHiringAnalysis({ profile: prof, roadmap: rdmp, resumeRows: resumes, skillRows: skills, fallbackPath })
        setAnalysis({ ...localAnalysis, courses })
      } finally {
        setIsAnalyzing(false)
      }
    }).catch(err => {
      console.error("Data load failed:", err)
      setIsAnalyzing(false)
    })
  }, [])

  if (isAnalyzing) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500"></div>
        <p className="animate-pulse font-display text-sm font-semibold text-muted">Analyzing your skill gaps...</p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="font-display text-lg font-semibold text-red-500">Failed to analyze skill gaps.</p>
        <p className="text-sm text-muted">Please check your profile data or try again later.</p>
      </div>
    )
  }

  const resources = analysis.courses?.slice(0, 9) || []

  return (
    <div className="space-y-xl">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas to-amber-500/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-sm rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 mb-4">
            <Wrench size={14} /> Gap Analysis
          </div>
          <h2 className="font-display text-3xl font-bold">{analysis.targetRole}</h2>
          <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body">These gaps are ranked like a hiring screen: missing proof first, then skills that need stronger projects, then polish items.</p>
        </div>
      </section>

      {/* Skills List */}
      <section className="grid gap-base lg:grid-cols-2">
        {(analysis.gaps || []).map((item) => {
          const label = item.skill
          const current = item.current
          const target = item.target
          const percent = Math.min(100, (current / target) * 100)
          const isCritical = item.priority === 'Critical'
          const isImportant = item.priority === 'Important'
          
          return (
            <article className={`group rounded-2xl border bg-canvas p-lg shadow-sm transition-all hover:shadow-md ${isCritical ? 'hover:border-red-300' : isImportant ? 'hover:border-amber-300' : 'hover:border-green-300'}`} key={label}>
              <div className="flex justify-between items-start gap-base mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                    {label}
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${isCritical ? 'bg-red-50 text-red-600 border border-red-200' : isImportant ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                      {item.priority}
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-body">{item.reason}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-ink leading-none">{current}<span className="text-sm text-muted">/{target}</span></p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-surface-strong overflow-hidden relative">
                <div 
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${isCritical ? 'from-red-400 to-red-500' : isImportant ? 'from-amber-400 to-amber-500' : 'from-green-400 to-green-500'}`}
                  style={{ width: `${percent}%` }} 
                />
              </div>
            </article>
          )
        })}
      </section>

      {/* Direct Links */}
      {resources.length > 0 && (
        <section className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm">
          <div className="flex items-center gap-sm mb-lg">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Zap size={20} /></div>
            <h2 className="font-display text-xl font-bold">Recommended Courses</h2>
          </div>
          <div className="grid gap-base md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <a className="group rounded-xl border border-hairline bg-canvas p-base hover:border-primary/30 hover:shadow-md transition-all flex flex-col h-full" href={resource.url} key={`${resource.provider}-${resource.skill || resource.title}`} rel="noreferrer" target="_blank">
                <div className="flex justify-between items-start mb-sm">
                  <div className="flex items-center gap-2">
                    {resource.logo && <img src={resource.logo} alt={resource.provider} className="h-5 w-5 object-contain" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-surface-soft px-2 py-1 rounded-md">{resource.provider}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">{resource.price}</span>
                </div>
                <h3 className="font-display font-bold text-ink mb-2">{resource.title}</h3>
                <p className="text-sm leading-relaxed text-body flex-1">{resource.reason}</p>
                <div className="mt-4 pt-3 border-t border-hairline flex items-center gap-1 text-xs font-semibold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Start Learning <ArrowRight size={14} />
                </div>
              </a>
            ))}
          </div>
          <div className="mt-lg flex justify-center">
            <Link className="inline-flex h-11 items-center gap-sm rounded-xl border border-hairline bg-surface-soft px-6 text-sm font-semibold text-ink hover:bg-canvas shadow-sm transition-all" to="/dashboard/courses">
              View All Courses <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Skills
