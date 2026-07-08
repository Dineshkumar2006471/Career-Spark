/*
 * Roadmap shows the AI-generated or fallback learning plan.
 * It exists to turn the chosen career path into weekly execution.
 */
import jsPDF from 'jspdf'
import { useEffect, useState } from 'react'
import { roadmapPhases } from '../../data/sampleData.js'
import { generateRoadmap } from '../../services/apiClient.js'
import { loadProfile, loadRoadmap, saveRoadmapChoice } from '../../services/supabaseData.js'
import { getTargetRole } from '../../services/careerAnalysis.js'

// Generates a simple roadmap PDF and returns no value.
function downloadRoadmap(careerPath, phases) {
  const doc = new jsPDF()
  doc.text(`CareerSpark Roadmap - ${careerPath}`, 20, 20)
  let y = 36
  phases.forEach((phase) => {
    doc.text(`${phase.title} - ${phase.timeline}`, 20, y)
    y += 8
    doc.text(phase.outcome, 20, y, { maxWidth: 170 })
    y += 18
    ;[
      ['Skills', phase.skills],
      ['Focus', phase.focus_areas],
      ['Weekly actions', phase.weekly_actions],
      ['Proof outputs', phase.proof_outputs],
    ].forEach(([label, items]) => {
      if (!Array.isArray(items) || !items.length) return
      doc.text(`${label}: ${items.join(', ')}`, 20, y, { maxWidth: 170 })
      y += 14
    })
    y += 8
    if (y > 260) {
      doc.addPage()
      y = 20
    }
  })
  doc.save('careerspark-roadmap.pdf')
}

function ResourceList({ title, items }) {
  if (!Array.isArray(items) || !items.length) return null
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{title}</p>
      <div className="mt-sm grid gap-sm md:grid-cols-2">
        {items.map((item) => (
          <a className="rounded-sm border border-hairline bg-surface-soft p-sm text-sm hover:bg-canvas" href={item.url || '#'} key={`${title}-${item.title}`} rel="noreferrer" target={item.url?.startsWith('/') ? undefined : '_blank'}>
            <span className="font-medium text-ink">{item.title}</span>
            <span className="mt-xxs block text-body">{item.provider}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function BulletList({ title, items }) {
  if (!Array.isArray(items) || !items.length) return null
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{title}</p>
      <div className="mt-sm space-y-xs">
        {items.map((item) => <p className="rounded-sm bg-surface-soft p-sm text-sm leading-6 text-body" key={item}>{item}</p>)}
      </div>
    </div>
  )
}

// Renders roadmap phases and returns a PDF export action.
function Roadmap() {
  const [careerPath, setCareerPath] = useState('Frontend Development')
  const [phases, setPhases] = useState(roadmapPhases)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    loadProfile().then(setProfile).catch(() => {})
    loadRoadmap()
      .then((row) => {
        if (!row) return
        setCareerPath(row.career_path || 'Frontend Development')
        if (Array.isArray(row.phases) && row.phases.length) setPhases(row.phases)
      })
      .catch((error) => setStatus(error.message))
  }, [])

  // Calls the AI roadmap backend and persists the returned phases.
  async function handleGenerateRoadmap() {
    try {
      setLoading(true)
      setStatus('')
      const savedPath = JSON.parse(localStorage.getItem('careerspark_path') || 'null')
      const pathTitle = getTargetRole(profile, null, savedPath) || careerPath || profile?.current_course || 'Student career path'
      const currentSkills = Array.isArray(profile?.skills) && profile.skills.length ? profile.skills : phases.flatMap((phase) => phase.skills).slice(0, 8)
      const goalNote = [profile?.goal_note, profile?.current_course, profile?.projects?.join(', ')].filter(Boolean).join(' | ')
      const data = await generateRoadmap({ career_path: pathTitle, current_skills: currentSkills, goal_note: goalNote })
      setCareerPath(data.career_path)
      setPhases(data.phases)
      await saveRoadmapChoice({ title: data.career_path }, data.phases)
      setStatus(data.provider_status === 'nvidia' ? 'Roadmap refreshed from NVIDIA NIM.' : 'Roadmap generated from CareerSpark fallback because the AI provider did not return valid structured JSON in time.')
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col justify-between gap-base md:flex-row md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.04em] text-primary">90-day plan</p>
          <h2 className="font-display text-3xl font-semibold">{careerPath} Roadmap</h2>
          <p className="mt-xs max-w-2xl text-sm leading-6 text-body">Structured from beginner level to target-role readiness: skills, focus areas, direct courses, certifications, internships, weekly actions, and proof outputs.</p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <button className="h-11 rounded-md border border-hairline bg-canvas px-lg text-sm font-medium text-ink hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} onClick={handleGenerateRoadmap} type="button">{loading ? 'Generating...' : 'Refresh AI roadmap'}</button>
          <button className="h-11 rounded-md bg-ink px-lg text-sm font-medium text-white hover:bg-primary" onClick={() => downloadRoadmap(careerPath, phases)} type="button">Download PDF</button>
        </div>
      </div>
      {status ? <p className="rounded-sm bg-primary-tint p-sm text-sm text-primary">{status}</p> : null}
      {phases.map((phase) => (
        <article className="rounded-lg border border-hairline bg-canvas p-lg" key={phase.title}>
          <div className="grid gap-lg lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-mono text-sm text-primary">{phase.timeline}</p>
              <h3 className="mt-xs font-display text-2xl font-semibold">{phase.title}</h3>
              <p className="mt-sm text-sm leading-6 text-body">{phase.outcome}</p>
              <div className="mt-base flex flex-wrap gap-sm">
                {(phase.skills || []).map((skill) => <span className="rounded-sm bg-primary-tint px-sm py-xs text-xs font-medium text-primary" key={skill}>{skill}</span>)}
              </div>
            </div>
            <div className="space-y-lg">
              <BulletList items={phase.focus_areas} title="Focus areas" />
              <BulletList items={phase.weekly_actions} title="Weekly actions" />
              <ResourceList items={phase.courses} title="Courses" />
              <ResourceList items={phase.certifications} title="Certifications" />
              <ResourceList items={phase.internships} title="Internships and simulations" />
              <BulletList items={phase.proof_outputs} title="Proof outputs" />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default Roadmap
