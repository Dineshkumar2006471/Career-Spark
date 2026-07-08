/*
 * Skills renders the skill gap analyzer.
 * It exists to compare current skills against target role requirements.
 */
import { useEffect, useState } from 'react'
import { loadProfile, loadRoadmap, loadSkillProgress } from '../../services/supabaseData.js'
import { buildHiringAnalysis, buildLearningResources, buildSimulationResources } from '../../services/careerAnalysis.js'

// Renders skill gaps and returns prioritized learning recommendations.
function Skills() {
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    loadProfile().then(setProfile).catch(() => {})
    loadRoadmap().then(setRoadmap).catch(() => {})
    loadSkillProgress().then((rows) => {
      if (rows.length) setItems(rows)
    }).catch(() => {})
  }, [])

  const analysis = buildHiringAnalysis({ profile, roadmap, resumeRows: [], skillRows: items })
  const resources = buildLearningResources(analysis.targetRole, analysis.gaps).slice(0, 9)
  const simulations = buildSimulationResources(analysis.targetRole)

  return (
    <div className="space-y-lg">
      <section className="rounded-lg border border-hairline bg-canvas p-lg">
        <p className="text-xs font-medium uppercase tracking-[0.04em] text-primary">Target role gap analysis</p>
        <h2 className="mt-sm font-display text-3xl font-semibold">{analysis.targetRole}</h2>
        <p className="mt-sm max-w-3xl text-sm leading-6 text-body">These gaps are ranked like a hiring screen: missing proof first, then skills that need stronger projects, then polish items.</p>
      </section>

      {analysis.gaps.map((item) => {
        const label = item.skill
        const current = item.current
        const target = item.target
        return (
        <article className="rounded-lg border border-hairline bg-canvas p-lg" key={label}>
          <div className="flex justify-between gap-base">
            <div>
              <h3 className="font-display text-lg font-semibold">{label}</h3>
              <p className="mt-xs text-sm text-body">{item.priority}: {item.reason}</p>
            </div>
            <p className="font-mono text-xl text-ink">{current}/{target}</p>
          </div>
          <div className="mt-base h-3 rounded-sm bg-surface-strong">
            <div className="h-3 rounded-sm bg-success" style={{ width: `${Math.min(100, (current / target) * 100)}%` }} />
          </div>
        </article>
      )})}

      <section className="rounded-lg border border-hairline bg-canvas p-lg">
        <h2 className="font-display text-xl font-semibold">Direct learning links for your top gaps</h2>
        <div className="mt-base grid gap-base md:grid-cols-3">
          {resources.map((resource) => (
            <a className="rounded-md border border-hairline p-base hover:bg-surface-soft" href={resource.url} key={`${resource.provider}-${resource.skill}`} rel="noreferrer" target="_blank">
              <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{resource.provider} / {resource.price}</p>
              <h3 className="mt-xs font-display font-semibold text-ink">{resource.title}</h3>
              <p className="mt-xs text-sm leading-6 text-body">{resource.reason}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-hairline bg-canvas p-lg">
        <h2 className="font-display text-xl font-semibold">Proof-building simulations and internships</h2>
        <div className="mt-base grid gap-base md:grid-cols-2">
          {simulations.map((resource) => (
            <a className="rounded-md border border-hairline p-base hover:bg-surface-soft" href={resource.url} key={resource.provider} rel="noreferrer" target="_blank">
              <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{resource.provider} / {resource.type}</p>
              <h3 className="mt-xs font-display font-semibold text-ink">{resource.title}</h3>
              <p className="mt-xs text-sm leading-6 text-body">{resource.reason}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Skills
