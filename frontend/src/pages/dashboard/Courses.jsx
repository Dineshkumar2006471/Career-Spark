/*
 * Courses renders direct external learning, simulation, and internship links
 * mapped to the student's target role and skill gaps.
 */
import { useEffect, useState } from 'react'
import { loadProfile, loadRoadmap, loadSkillProgress } from '../../services/supabaseData.js'
import { buildHiringAnalysis, buildLearningResources, buildSimulationResources } from '../../services/careerAnalysis.js'

// Renders course recommendations and returns a filter-ready list.
function Courses() {
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [skills, setSkills] = useState([])

  useEffect(() => {
    loadProfile().then(setProfile).catch(() => {})
    loadRoadmap().then(setRoadmap).catch(() => {})
    loadSkillProgress().then(setSkills).catch(() => {})
  }, [])

  const analysis = buildHiringAnalysis({ profile, roadmap, resumeRows: [], skillRows: skills })
  const courses = buildLearningResources(analysis.targetRole, analysis.gaps)
  const simulations = buildSimulationResources(analysis.targetRole)

  return (
    <div className="space-y-lg">
      <section className="rounded-lg border border-hairline bg-canvas p-lg">
        <p className="text-xs font-medium uppercase tracking-[0.04em] text-primary">Resource hub</p>
        <h2 className="mt-sm font-display text-3xl font-semibold">Courses for {analysis.targetRole}</h2>
        <p className="mt-sm max-w-3xl text-sm leading-6 text-body">These are direct external links generated from your target role and top skill gaps. CareerSpark does not pretend one static course fits everyone; it sends you to the right catalog/search page for your current gap.</p>
      </section>

      <section className="grid gap-lg">
        {courses.map((course) => (
          <a className="rounded-lg border border-hairline bg-canvas p-lg hover:bg-surface-soft md:flex md:items-center md:justify-between" href={course.url} key={`${course.provider}-${course.skill}-${course.title}`} rel="noreferrer" target="_blank">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{course.provider} / {course.type}</p>
              <h3 className="mt-xs font-display text-lg font-semibold">{course.title}</h3>
              <p className="mt-xs text-sm text-body">{course.reason}</p>
            </div>
            <span className="mt-base inline-flex rounded-sm border border-hairline bg-canvas px-sm py-xs text-xs font-medium text-success md:mt-0">{course.price}</span>
          </a>
        ))}
      </section>

      <section className="rounded-lg border border-hairline bg-canvas p-lg">
        <h2 className="font-display text-xl font-semibold">Virtual internships and simulations</h2>
        <div className="mt-base grid gap-base md:grid-cols-2">
          {simulations.map((item) => (
            <a className="rounded-md border border-hairline p-base hover:bg-surface-soft" href={item.url} key={item.provider} rel="noreferrer" target="_blank">
              <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{item.provider} / {item.price}</p>
              <h3 className="mt-xs font-display font-semibold text-ink">{item.title}</h3>
              <p className="mt-xs text-sm leading-6 text-body">{item.reason}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Courses
