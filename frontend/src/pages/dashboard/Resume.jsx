/*
 * Resume renders the ATS score analyzer and resume history entry point.
 * It exists to provide the third and final approved Match Compass usage.
 */
import { useState } from 'react'
import { useEffect } from 'react'
import MatchCompass from '../../components/ui/MatchCompass.jsx'
import { analyzeResume, analyzeResumeFile } from '../../services/apiClient.js'
import { loadResumeVersions, saveResumeVersion } from '../../services/supabaseData.js'

// Renders the resume analyzer and returns ATS feedback.
function Resume() {
  const [text, setText] = useState('')
  const [result, setResult] = useState({ score: 72, suggestions: ['Add measurable project outcomes.', 'Mention React, APIs, and Git in the top half.', 'Use stronger action verbs for internships.'] })
  const [history, setHistory] = useState([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadResumeVersions().then(setHistory).catch(() => {})
  }, [])

  // Sends resume text to the backend and returns no value.
  async function handleAnalyze() {
    try {
      setLoading(true)
      const data = await analyzeResume({ text, target_role: 'Frontend Development' })
      setResult(data)
      const saved = await saveResumeVersion('pasted-resume.txt', data.score, { suggestions: data.suggestions })
      if (saved) setHistory((current) => [saved, ...current])
    } catch (error) {
      setResult({ score: 60, suggestions: [error.message] })
    } finally {
      setLoading(false)
    }
  }

  // Uploads a resume file to the backend parser and returns no value.
  async function handleFileAnalyze(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    try {
      setLoading(true)
      const data = await analyzeResumeFile(file, 'Frontend Development')
      setResult(data)
      setText(data.extracted_text || '')
      const saved = await saveResumeVersion(file.name, data.score, { suggestions: data.suggestions })
      if (saved) setHistory((current) => [saved, ...current])
    } catch (error) {
      setResult({ score: 60, suggestions: [error.message] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-lg lg:grid-cols-[320px_1fr]">
      <MatchCompass label="Resume ATS Score" score={result.score} status="Needs targeted improvement" />
      <section className="rounded-lg border border-hairline bg-canvas p-lg">
        <h2 className="font-display text-3xl font-semibold">Resume Intelligence</h2>
        <label className="mt-lg flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-hairline bg-surface-soft p-base text-center text-sm text-body hover:bg-surface-strong">
          <span className="font-medium text-ink">{fileName || 'Upload PDF, DOCX, or TXT resume'}</span>
          <span className="mt-xs">CareerSpark extracts the text and stores your ATS score history.</span>
          <input accept=".pdf,.docx,.txt" className="sr-only" onChange={handleFileAnalyze} type="file" />
        </label>
        <textarea className="mt-lg min-h-48 w-full rounded-sm bg-surface-strong p-base text-sm text-ink" onChange={(event) => setText(event.target.value)} placeholder="Or paste resume text here for quick analysis." value={text} />
        <button className="mt-base h-11 rounded-md bg-ink px-lg text-sm font-medium text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={loading || !text.trim()} onClick={handleAnalyze} type="button">{loading ? 'Analyzing...' : 'Analyze pasted text'}</button>
        <div className="mt-lg space-y-sm">
          {result.suggestions.map((suggestion) => <p className="rounded-sm bg-surface-soft p-sm text-sm text-body" key={suggestion}>{suggestion}</p>)}
        </div>
        {history.length ? (
          <div className="mt-lg border-t border-hairline pt-lg">
            <h3 className="font-display text-lg font-semibold">Score history</h3>
            <div className="mt-sm grid gap-sm">
              {history.slice(0, 4).map((item) => <p className="text-sm text-body" key={item.id}>{item.file_name}: {item.ats_score}/100</p>)}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default Resume
