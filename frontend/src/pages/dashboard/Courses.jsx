/*
 * Courses renders direct external learning, simulation, and internship links
 * mapped to the student's target role and skill gaps.
 */
import { BookOpen, ExternalLink, PlaySquare, Search, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadProfile, loadRoadmap, loadSkillProgress, loadResumeVersions } from '../../services/supabaseData.js'
import { fetchDashboardAnalysis } from '../../services/apiClient.js'
import { buildDashboardPayload } from '../../services/careerAnalysis.js'

// Renders course recommendations and returns a filter-ready list.
function Courses() {
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [skills, setSkills] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    Promise.all([
      loadProfile(),
      loadRoadmap(),
      loadSkillProgress(),
      loadResumeVersions()
    ]).then(async ([prof, rdmp, skillsList, resumes]) => {
      if (prof) setProfile(prof)
      if (rdmp) setRoadmap(rdmp)
      if (skillsList?.length) setSkills(skillsList)
      
      try {
        const aiAnalysis = await fetchDashboardAnalysis(buildDashboardPayload(prof, rdmp, resumes))
        setAnalysis(aiAnalysis)
      } catch (err) {
        console.error("AI Analysis failed:", err)
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500"></div>
        <p className="animate-pulse font-display text-sm font-semibold text-muted">Gemini AI is finding courses with Google Search...</p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="font-display text-lg font-semibold text-red-500">Failed to load courses.</p>
        <p className="text-sm text-muted">Please check your Vertex AI integration or try again later.</p>
      </div>
    )
  }

  const courses = analysis.courses || []
  const simulations = analysis.simulations || []

  return (
    <div className="space-y-xl">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas to-blue-500/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-sm rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">
            <Search size={14} /> Resource Hub
          </div>
          <h2 className="font-display text-3xl font-bold">Dynamic AI Courses for {analysis.targetRole}</h2>
          <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body">These are direct external links generated live via Gemini 2.5 Flash with Google Search Grounding. No static lists or cache are used.</p>
        </div>
      </section>

      {/* Courses List */}
      <section className="space-y-base">
        <div className="flex items-center gap-sm mb-lg">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen size={20} /></div>
          <h2 className="font-display text-xl font-bold">Recommended Courses</h2>
        </div>
        <div className="grid gap-base md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <a className="group rounded-2xl border border-hairline bg-canvas p-lg hover:border-primary/30 hover:shadow-md transition-all flex flex-col h-full" href={course.url} key={`course-${index}`} rel="noreferrer" target="_blank">
              <div className="flex justify-between items-start mb-base">
                <div className="flex items-center gap-2">
                  {course.logo && <img src={course.logo} alt={course.provider} className="h-6 w-6 object-contain" />}
                  <span className="inline-flex rounded-lg bg-surface-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted border border-hairline">{course.provider}</span>
                </div>
                <span className="inline-flex rounded-lg bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-200">{course.price}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-ink mb-2">{course.title}</h3>
              <p className="text-sm leading-relaxed text-body flex-1">{course.reason}</p>
              
              <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Zap size={12} /> {course.skill || "Core Skill"}
                </span>
                <ExternalLink size={16} className="text-muted group-hover:text-primary transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Virtual Internships & Simulations */}
      <section className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm mt-xl">
        <div className="flex items-center gap-sm mb-lg">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600"><PlaySquare size={20} /></div>
          <h2 className="font-display text-xl font-bold">Virtual Internships & Simulations</h2>
        </div>
        <div className="grid gap-base md:grid-cols-2">
          {simulations.map((item, index) => (
            <a className="group flex flex-col sm:flex-row sm:items-center justify-between gap-base rounded-xl border border-hairline bg-surface-soft p-base hover:bg-canvas hover:border-primary/30 hover:shadow-md transition-all" href={item.url} key={`sim-${index}`} rel="noreferrer" target="_blank">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">{item.provider} • {item.price}</p>
                <h3 className="font-display font-bold text-ink text-base">{item.title}</h3>
                <p className="mt-1 text-sm text-body line-clamp-1">{item.reason}</p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-hairline text-ink group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                  <ExternalLink size={16} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Courses
