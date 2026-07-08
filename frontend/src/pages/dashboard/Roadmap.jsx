/*
 * Roadmap renders the 90-day career plan timeline with premium visuals
 * and a professional PDF download with clickable links.
 */
import { ArrowRight, Award, BookOpen, BriefcaseBusiness, CheckCircle2, ChevronDown, ChevronUp, Download, ExternalLink, Map, Target, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadProfile, loadRoadmap, loadSkillProgress } from '../../services/supabaseData.js'
import { getTargetRole } from '../../services/careerAnalysis.js'
import { roadmapPhases } from '../../data/sampleData.js'

// Renders the roadmap page.
function Roadmap() {
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [skillRows, setSkillRows] = useState([])
  const [expandedPhase, setExpandedPhase] = useState(0)

  useEffect(() => {
    loadProfile().then(setProfile).catch(() => {})
    loadRoadmap().then(setRoadmap).catch(() => {})
    loadSkillProgress().then((rows) => rows.length && setSkillRows(rows)).catch(() => {})
  }, [])

  const targetRole = getTargetRole(profile, roadmap)
  const phases = Array.isArray(roadmap?.phases) && roadmap.phases.length ? roadmap.phases : roadmapPhases
  const progress = roadmap?.progress_percent ?? 34

  // Generates a professional PDF with clickable links using jspdf.
  async function downloadRoadmap() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxW = pageW - margin * 2
    let y = margin

    function checkPageBreak(needed) {
      if (y + needed > 270) {
        doc.addPage()
        y = margin
      }
    }

    // Cover
    doc.setFillColor(22, 82, 240)
    doc.rect(0, 0, pageW, 50, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.text('CareerSpark', margin, 25)
    doc.setFontSize(13)
    doc.text('90-Day Career Roadmap', margin, 37)
    doc.setTextColor(33, 33, 33)
    y = 65

    doc.setFontSize(20)
    doc.text(`Target: ${targetRole}`, margin, y)
    y += 10
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const studentName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Student'
    doc.text(`Prepared for: ${studentName}  •  ${new Date().toLocaleDateString('en-IN')}`, margin, y)
    y += 15

    // Phases
    phases.forEach((phase, index) => {
      checkPageBreak(60)
      doc.setFillColor(240, 244, 255)
      doc.roundedRect(margin - 2, y - 4, maxW + 4, 14, 3, 3, 'F')
      doc.setFontSize(14)
      doc.setTextColor(22, 82, 240)
      doc.text(`Phase ${index + 1}: ${phase.title}`, margin, y + 5)
      y += 16
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`Timeline: ${phase.timeline}`, margin, y)
      y += 7

      // Skills
      if (phase.detailed_skills?.length) {
        checkPageBreak(20)
        doc.setFontSize(11)
        doc.setTextColor(33, 33, 33)
        doc.text('Detailed Skills & Resources:', margin, y)
        y += 6
        phase.detailed_skills.forEach((skill) => {
          checkPageBreak(12)
          doc.setFontSize(10)
          doc.setTextColor(22, 82, 240)
          doc.text(`• ${skill.skill_name}`, margin + 4, y)
          y += 5
          doc.setFontSize(9)
          doc.setTextColor(60, 60, 60)
          const summaryLines = doc.splitTextToSize(skill.summary, maxW - 12)
          doc.text(summaryLines, margin + 8, y)
          y += summaryLines.length * 4 + 2

          // Courses for this skill
          if (skill.courses?.length) {
            skill.courses.forEach((course) => {
              checkPageBreak(6)
              doc.setTextColor(33, 150, 243)
              doc.textWithLink(`[Course] ${course.title} — ${course.provider}`, margin + 8, y, { url: course.url })
              y += 5
            })
          }
          // Certifications for this skill
          if (skill.certifications?.length) {
            skill.certifications.forEach((cert) => {
              checkPageBreak(6)
              doc.setTextColor(156, 39, 176)
              doc.textWithLink(`[Cert] ${cert.title} — ${cert.provider}`, margin + 8, y, { url: cert.url })
              y += 5
            })
          }
          y += 3
        })
      }

      // Step-by-Step Plan
      if (phase.step_by_step_plan?.length) {
        checkPageBreak(20)
        doc.setFontSize(11)
        doc.setTextColor(33, 33, 33)
        doc.text('Step-by-Step Plan:', margin, y)
        y += 5
        phase.step_by_step_plan.forEach((step) => {
          checkPageBreak(6)
          doc.setFontSize(9)
          doc.setTextColor(33, 33, 33)
          doc.setFont(undefined, 'bold')
          doc.text(`${step.timeframe}:`, margin + 4, y)
          doc.setFont(undefined, 'normal')
          doc.setTextColor(60, 60, 60)
          const lines = doc.splitTextToSize(step.action, maxW - 25)
          doc.text(lines, margin + 22, y)
          y += lines.length * 4 + 1
        })
        y += 3
      }

      // Proof outputs
      if (phase.proof_outputs?.length) {
        checkPageBreak(20)
        doc.setFontSize(11)
        doc.setTextColor(33, 33, 33)
        doc.text('Proof Outputs:', margin, y)
        y += 5
        phase.proof_outputs.forEach((item) => {
          checkPageBreak(6)
          doc.setFontSize(9)
          doc.setTextColor(60, 60, 60)
          doc.text(`☐ ${item}`, margin + 4, y)
          y += 5
        })
      }

      y += 12
    })

    // Footer
    checkPageBreak(20)
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageW - margin, y)
    y += 8
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Generated by CareerSpark — Powered by Gemini AI', margin, y)

    doc.save(`CareerSpark_Roadmap_${targetRole.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div className="space-y-xl">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas to-primary/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="relative flex flex-wrap items-start justify-between gap-lg">
          <div>
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-4">
              <Map size={14} /> 90-Day Roadmap
            </div>
            <h2 className="font-display text-3xl font-bold">{targetRole}</h2>
            <p className="mt-sm max-w-xl text-sm leading-relaxed text-body">Your personalized career roadmap with weekly actions, courses, certifications, and internship links.</p>
            {/* Progress Bar */}
            <div className="mt-lg max-w-md">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">Overall Progress</span>
                <span className="font-mono font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-surface-strong overflow-hidden">
                <div className="h-3 rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          <button className="inline-flex h-12 items-center gap-sm rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-primary shadow-md hover:shadow-lg transition-all" onClick={downloadRoadmap} type="button">
            <Download size={18} /> Download PDF
          </button>
        </div>
      </section>

      {/* Phase Timeline */}
      <div className="space-y-lg">
        {phases.map((phase, index) => {
          const isExpanded = expandedPhase === index
          return (
            <article className={`rounded-2xl border bg-canvas shadow-sm transition-all ${isExpanded ? 'border-primary/30 shadow-md' : 'border-hairline hover:shadow-md'}`} key={phase.title}>
              <button className="w-full flex items-center gap-lg p-xl text-left" onClick={() => setExpandedPhase(isExpanded ? -1 : index)} type="button">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{phase.timeline}</p>
                  <h3 className="font-display text-xl font-bold mt-xs">{phase.title}</h3>
                  <div className="mt-sm flex flex-wrap gap-xs">
                    {phase.detailed_skills?.map((skill) => (
                      <span className="rounded-full bg-surface-soft border border-hairline px-2.5 py-0.5 text-xs font-medium text-body" key={skill.skill_name}>{skill.skill_name}</span>
                    ))}
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-muted shrink-0" /> : <ChevronDown size={20} className="text-muted shrink-0" />}
              </button>

              {isExpanded && (
                <div className="border-t border-hairline px-xl pb-xl">
                  {/* Outcome */}
                  <div className="mt-lg rounded-xl bg-green-50/50 border border-green-100 p-base">
                    <p className="flex items-start gap-sm text-sm leading-relaxed text-body">
                      <Target size={16} className="mt-0.5 text-green-600 shrink-0" />{phase.outcome}
                    </p>
                  </div>

                  {/* Detailed Skills & Resources */}
                  {phase.detailed_skills?.length > 0 && (
                    <div className="mt-lg">
                      <h4 className="flex items-center gap-sm font-display font-bold text-base mb-sm"><Zap size={16} className="text-primary" /> Skills to Develop</h4>
                      <div className="space-y-base">
                        {phase.detailed_skills.map((skill, i) => (
                          <div key={i} className="rounded-xl border border-hairline bg-surface-soft/30 p-base">
                            <h5 className="font-display font-bold text-ink">{skill.skill_name}</h5>
                            <p className="mt-1 text-sm text-body leading-relaxed">{skill.summary}</p>
                            
                            {(skill.courses?.length > 0 || skill.certifications?.length > 0) && (
                              <div className="mt-3 grid gap-2 md:grid-cols-2">
                                {skill.courses?.map((course, j) => (
                                  <a className="group flex flex-col rounded-lg border border-hairline bg-canvas p-3 hover:border-primary/30 hover:shadow-sm transition-all" href={course.url} key={`course-${j}`} rel="noreferrer" target="_blank">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary mb-1"><BookOpen size={12} /> Course</span>
                                    <span className="text-sm font-semibold text-ink line-clamp-1">{course.title}</span>
                                    <span className="mt-0.5 text-xs text-body flex items-center justify-between">{course.provider} <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" /></span>
                                  </a>
                                ))}
                                {skill.certifications?.map((cert, j) => (
                                  <a className="group flex flex-col rounded-lg border border-hairline bg-canvas p-3 hover:border-primary/30 hover:shadow-sm transition-all" href={cert.url} key={`cert-${j}`} rel="noreferrer" target="_blank">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-1"><Award size={12} /> Certification</span>
                                    <span className="text-sm font-semibold text-ink line-clamp-1">{cert.title}</span>
                                    <span className="mt-0.5 text-xs text-body flex items-center justify-between">{cert.provider} <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" /></span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Plan */}
                  {phase.step_by_step_plan?.length > 0 && (
                    <div className="mt-lg">
                      <h4 className="flex items-center gap-sm font-display font-bold text-base mb-sm"><CheckCircle2 size={16} className="text-green-600" /> Step-by-Step Plan</h4>
                      <div className="overflow-hidden rounded-xl border border-hairline bg-canvas">
                        <table className="w-full text-left text-sm">
                          <tbody className="divide-y divide-hairline">
                            {phase.step_by_step_plan.map((step, i) => (
                              <tr key={i} className="hover:bg-surface-soft/50 transition-colors">
                                <td className="w-1/4 whitespace-nowrap p-4 font-semibold text-ink bg-surface-soft/20">{step.timeframe}</td>
                                <td className="p-4 text-body">{step.action}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Proof Outputs */}
                  {phase.proof_outputs?.length > 0 && (
                    <div className="mt-lg">
                      <h4 className="font-display font-bold text-base mb-sm">Proof Outputs</h4>
                      <div className="flex flex-wrap gap-sm">
                        {phase.proof_outputs.map((item, i) => (
                          <span className="inline-flex items-center gap-xs rounded-full bg-surface-soft border border-hairline px-3 py-1.5 text-xs font-medium text-body" key={i}>
                            <CheckCircle2 size={12} className="text-green-500" />{item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default Roadmap
