/*
 * Home renders the dashboard overview with the required metric priority.
 * It exists as the student launchpad for roadmap, gaps, certifications, resume, and next action.
 */
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MatchCompass from '../../components/ui/MatchCompass.jsx'
import { careerPaths, roadmapPhases } from '../../data/sampleData.js'
import { loadCertifications, loadLatestAssessment, loadProfile, loadResumeVersions, loadRoadmap, loadSkillProgress, subscribeToUserTable } from '../../services/supabaseData.js'
import { buildHiringAnalysis } from '../../services/careerAnalysis.js'

// Reads the selected career path and returns a safe fallback path.
function getSelectedPath() {
  return JSON.parse(localStorage.getItem('careerspark_path') || 'null') || careerPaths[0]
}

// Renders dashboard home and returns metric cards in priority order.
function Home() {
  const [path, setPath] = useState(getSelectedPath())
  const [skillRows, setSkillRows] = useState([])
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [certifications, setCertifications] = useState([])
  const [resumeRows, setResumeRows] = useState([])
  const analysis = buildHiringAnalysis({ profile, roadmap, resumeRows, skillRows, fallbackPath: path })
  const completedSkills = analysis.gaps.filter((item) => item.current >= item.target).length
  const totalSkills = analysis.gaps.length
  const roadmapProgress = roadmap?.progress_percent ?? Math.round((completedSkills / Math.max(1, totalSkills)) * 100)
  const completedCertifications = certifications.filter((item) => item.status === 'completed').length
  const applicationCount = Array.isArray(profile?.applications) ? profile.applications.length : 0
  const activePhases = Array.isArray(roadmap?.phases) && roadmap.phases.length ? roadmap.phases : roadmapPhases

  useEffect(() => {
    let unsubscribe = () => {}
    loadProfile().then(setProfile).catch(() => {})
    loadRoadmap().then((roadmap) => {
      if (roadmap) setRoadmap(roadmap)
      if (roadmap?.career_path) setPath({ ...getSelectedPath(), title: roadmap.career_path, summary: `Roadmap personalized from your profile, skills, projects, and current course.` })
    }).catch(() => {})
    loadLatestAssessment().then((assessment) => {
      const firstResult = assessment?.results?.[0]
      if (firstResult) setPath(firstResult)
    }).catch(() => {})
    loadSkillProgress().then((rows) => {
      if (rows.length) setSkillRows(rows)
    }).catch(() => {})
    loadCertifications().then(setCertifications).catch(() => {})
    loadResumeVersions().then(setResumeRows).catch(() => {})
    subscribeToUserTable('skill_progress', () => {
      loadSkillProgress().then((rows) => rows.length && setSkillRows(rows)).catch(() => {})
    }).then((cleanup) => {
      unsubscribe = cleanup
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="space-y-xl">
      <section className="rounded-lg border border-hairline bg-canvas p-xl">
        <div className="grid gap-lg lg:grid-cols-[280px_1fr] lg:items-center">
          <MatchCompass label={path.title} score={path.match} status="Career Match Score" />
          <div>
            <p className="inline-flex rounded-sm border border-hairline px-sm py-xs text-xs font-medium uppercase tracking-[0.04em] text-body">Hiring readiness</p>
            <h2 className="mt-lg max-w-2xl font-display text-4xl font-semibold leading-[1.05]">Target role: {analysis.targetRole}</h2>
            <p className="mt-base max-w-2xl text-sm leading-6 text-body">CareerSpark is now reading your profile, resume, projects, skills, and roadmap as shortlisting signals. The score below is not a generic career match; it is a practical readiness estimate for this target.</p>
            <div className="mt-lg flex flex-wrap gap-sm">
              <Link className="inline-flex h-11 items-center rounded-md bg-ink px-lg text-sm font-medium text-white hover:bg-primary" to="/dashboard/skills">Fix top gaps</Link>
              <Link className="inline-flex h-11 items-center rounded-md border border-hairline px-lg text-sm font-medium text-ink hover:bg-surface-soft" to="/dashboard/courses">Find direct courses</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-lg md:grid-cols-2 xl:grid-cols-5">
        {[
          ['Roadmap Progress', `${roadmapProgress}%`, roadmap?.career_path || 'Complete your profile roadmap'],
          ['Skills Completed', `${completedSkills}/${totalSkills}`, 'Calculated from profile skill gaps'],
          ['Certifications Earned', `${completedCertifications}`, 'Tracked from certifications screen'],
          ['Resume Score', analysis.resumeScore ?? 'Not scored', analysis.resumeScore ? 'Latest resume analysis' : 'Upload a resume to score it'],
          ['Applications', `${applicationCount}`, 'From your profile applications list'],
        ].map(([label, value, caption]) => (
          <article className="rounded-lg border border-hairline bg-canvas p-lg" key={label}>
            <p className="text-sm text-body">{label}</p>
            <p className="mt-xs font-mono text-[32px] font-medium text-ink">{value}</p>
            <p className="mt-xs text-sm text-muted">{caption}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-lg lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-lg border border-hairline bg-canvas p-lg">
          <h2 className="font-display text-lg font-semibold">Skill Gap Snapshot</h2>
          <div className="mt-lg space-y-base">
            {analysis.gaps.map((item) => {
              const label = item.skill
              const current = item.current
              const target = item.target
              return (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-mono">{current}/{target}</span>
                </div>
                <div className="mt-xs h-2 rounded-sm bg-surface-strong">
                  <div className="h-2 rounded-sm bg-primary" style={{ width: `${Math.min(100, current)}%` }} />
                </div>
              </div>
            )})}
          </div>
        </article>
        <article className="rounded-lg border border-hairline bg-canvas p-lg">
          <h2 className="font-display text-lg font-semibold">Shortlisting diagnosis</h2>
          <div className="mt-lg space-y-sm">
            {[...analysis.strongestSignals, ...analysis.riskSignals, ...analysis.nextActions].map((item) => (
              <p className="rounded-sm bg-surface-soft p-sm text-sm text-body" key={item}>{item}</p>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-hairline bg-canvas p-lg">
        <h2 className="font-display text-lg font-semibold">Roadmap phase stepper</h2>
        <div className="mt-lg grid gap-base lg:grid-cols-3">
          {activePhases.map((phase) => (
            <article className="rounded-md border border-hairline p-base" key={phase.title}>
              <p className="font-display font-semibold">{phase.title}</p>
              <p className="mt-xs text-sm text-primary">{phase.timeline}</p>
              <p className="mt-sm text-sm leading-6 text-body">{phase.outcome}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
