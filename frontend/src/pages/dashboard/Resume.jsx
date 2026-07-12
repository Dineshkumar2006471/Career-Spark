/*
 * Resume renders a standalone resume analyzer with drag-and-drop upload,
 * Gemini AI-powered section extraction, ATS scoring, and score history.
 */
import { ArrowRight, CheckCircle2, FileText, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { analyzeResumeFile } from '../../services/apiClient.js'
import { loadProfile, loadResumeVersions, saveResumeVersion } from '../../services/supabaseData.js'
import { getTargetRole } from '../../services/careerAnalysis.js'

// Renders a circular ATS score indicator.
function ScoreRing({ score }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#16A34A' : score >= 55 ? '#D97706' : '#DC2626'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="130" height="130" className="-rotate-90">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#EDEFF3" strokeWidth="10" />
        <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-3xl font-bold text-ink">{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">ATS Score</span>
      </div>
    </div>
  )
}

// Renders the resume analyzer page.
function Resume() {
  const [profile, setProfile] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState('idle')
  const [dragActive, setDragActive] = useState(false)
  const targetRole = getTargetRole(profile)

  useEffect(() => {
    loadProfile().then(setProfile).catch(() => {})
    loadResumeVersions().then(setHistory).catch(() => {})
  }, [])

  // Handles file upload and triggers analysis.
  async function handleFile(file) {
    if (!file) return
    setStatus('analyzing')
    setResult(null)
    try {
      const data = await analyzeResumeFile(file, targetRole || 'Student career profile')
      setResult(data)
      setStatus('done')
      await saveResumeVersion(file.name, data.score, { suggestions: data.suggestions })
      loadResumeVersions().then(setHistory).catch(() => {})
    } catch (error) {
      setStatus('error')
      setResult({ score: 0, suggestions: [error.message], extracted_skills: [], extracted_projects: [], extracted_education: [], extracted_experience: [], profile_summary: '', extracted_text: '' })
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-xl">
      {/* Page Header */}
      <section className="rounded-2xl border border-hairline bg-gradient-to-br from-canvas to-primary/5 p-xl shadow-sm">
        <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-4">
          <FileText size={14} />
          AI Resume Analyzer
        </div>
        <h2 className="font-display text-3xl font-bold">Resume Intelligence</h2>
        <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body">Upload your resume and let Gemini AI extract skills, projects, education, and experience. Get an ATS readiness score with actionable improvement suggestions.</p>
      </section>

      {/* Upload Zone */}
      <div
        className={`rounded-2xl border-2 border-dashed p-xl text-center transition-all cursor-pointer ${dragActive ? 'border-primary bg-primary/5 shadow-lg' : 'border-hairline bg-canvas hover:border-primary/30 hover:bg-surface-soft'}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('resume-upload-input').click()}
      >
        <div className="flex flex-col items-center gap-base">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Upload size={28} />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ink">{status === 'analyzing' ? 'Analyzing your resume...' : 'Drop your resume here or click to browse'}</p>
            <p className="mt-xs text-sm text-muted">Supports PDF, DOCX, and TXT files</p>
          </div>
          {status === 'analyzing' && (
            <div className="h-1.5 w-48 rounded-full bg-surface-strong overflow-hidden">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-primary to-blue-400 animate-pulse" style={{ width: '70%' }} />
            </div>
          )}
        </div>
        <input id="resume-upload-input" accept=".pdf,.docx,.txt" className="hidden" onChange={handleInputChange} type="file" />
      </div>

      {/* Results & Errors */}
      {status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-lg text-center shadow-sm">
          <p className="text-red-600 font-semibold text-lg mb-2">Error analyzing resume</p>
          <p className="text-red-500 text-sm">{result?.suggestions?.[0] || 'Unknown error occurred.'}</p>
        </div>
      )}

      {result && status === 'done' && (
        <div className="grid gap-xl lg:grid-cols-[320px_1fr]">
          {/* Score + Suggestions Column */}
          <div className="space-y-lg">
            <article className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm text-center">
              <ScoreRing score={result.score} />
              <p className="mt-lg font-display text-lg font-bold">{result.score >= 80 ? 'Strong Resume' : result.score >= 55 ? 'Needs Improvement' : 'Weak — Major Gaps'}</p>
              <p className="mt-xs text-sm text-body">for {targetRole || 'general'} roles</p>
            </article>
            <article className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
              <h3 className="font-display font-bold text-lg mb-base">Suggestions</h3>
              <div className="space-y-sm">
                {result.suggestions.map((text, i) => (
                  <p className="flex items-start gap-sm rounded-xl bg-amber-50/50 border border-amber-100 p-sm text-sm text-body" key={i}>
                    <ArrowRight size={14} className="mt-0.5 text-amber-600 shrink-0" />{text}
                  </p>
                ))}
              </div>
            </article>
          </div>

          {/* Extracted Sections */}
          <div className="space-y-lg">
            {result.profile_summary && (
              <article className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
                <h3 className="font-display font-bold text-lg mb-sm">Profile Summary</h3>
                <p className="text-sm leading-relaxed text-body">{result.profile_summary}</p>
              </article>
            )}
            {result.extracted_skills?.length > 0 && (
              <article className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
                <h3 className="font-display font-bold text-lg mb-base">Extracted Skills</h3>
                <div className="flex flex-wrap gap-sm">
                  {result.extracted_skills.map((skill, i) => (
                    <span className="inline-flex items-center gap-xs rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary" key={i}>
                      <CheckCircle2 size={12} />{skill}
                    </span>
                  ))}
                </div>
              </article>
            )}
            {result.extracted_projects?.length > 0 && (
              <article className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
                <h3 className="font-display font-bold text-lg mb-base">Projects Found</h3>
                <div className="grid gap-sm md:grid-cols-2">
                  {result.extracted_projects.map((project, i) => (
                    <div className="rounded-xl bg-surface-soft p-base border border-hairline" key={i}>
                      <p className="text-sm font-medium text-ink">{project}</p>
                    </div>
                  ))}
                </div>
              </article>
            )}
            {result.extracted_education?.length > 0 && (
              <article className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
                <h3 className="font-display font-bold text-lg mb-base">Education</h3>
                <div className="space-y-sm">
                  {result.extracted_education.map((item, i) => (
                    <p className="flex items-start gap-sm text-sm text-body" key={i}>
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0"></span>{item}
                    </p>
                  ))}
                </div>
              </article>
            )}
            {result.extracted_experience?.length > 0 && (
              <article className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
                <h3 className="font-display font-bold text-lg mb-base">Experience</h3>
                <div className="space-y-sm">
                  {result.extracted_experience.map((item, i) => (
                    <p className="flex items-start gap-sm text-sm text-body" key={i}>
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-green-500 shrink-0"></span>{item}
                    </p>
                  ))}
                </div>
              </article>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Resume
