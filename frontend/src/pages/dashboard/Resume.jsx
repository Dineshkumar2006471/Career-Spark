/*
 * Resume renders a standalone resume analyzer with drag-and-drop upload,
 * Gemini AI-powered section extraction, ATS scoring, and score history.
 */
import { CheckCircle2, FileText, UploadCloud, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { analyzeResumeFile } from '../../services/apiClient.js'
import { loadProfile, loadResumeVersions, saveResumeVersion } from '../../services/supabaseData.js'
import { getTargetRole } from '../../services/careerAnalysis.js'

// Renders a circular ATS score indicator.
function ScoreRing({ score }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10B981' : score >= 55 ? '#F59E0B' : '#EF4444' // Tailwind Emerald-500, Amber-500, Red-500
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="12" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center pt-1">
        <div className="flex items-baseline">
          <span className="font-display text-4xl font-bold text-ink tracking-tighter">{score}</span>
          <span className="text-sm font-bold text-muted">/100</span>
        </div>
      </div>
    </div>
  )
}

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

  // Use Real Scores from Backend AI
  const atsScore = result?.score || 0
  const grammarScore = result?.grammar_score || 0
  const keywordScore = result?.keyword_score || 0
  const formattingScore = result?.formatting_score || 0

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header (Minimal, matching UI reference) */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink">Resume Analyzer</h2>
        <p className="text-sm text-body">Get AI feedback to build a winning resume</p>
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <h4 className="text-red-700 font-bold text-sm">Failed to analyze resume</h4>
            <p className="text-red-600 text-xs mt-1">{result?.suggestions?.[0] || 'Unknown error occurred.'}</p>
          </div>
        </div>
      )}

      {/* TOP ROW: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Upload */}
        <div className="rounded-3xl border border-hairline bg-canvas p-6 flex flex-col shadow-sm h-[320px]">
          <div 
            className={`flex-1 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center transition-all cursor-pointer ${dragActive ? 'border-primary bg-primary/5' : 'border-hairline hover:border-primary/40'}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resume-upload-input').click()}
          >
            <UploadCloud size={44} strokeWidth={1.5} className="text-primary/70 mb-4" />
            <h3 className="font-display font-bold text-ink text-lg">Drag & Drop Resume</h3>
            <p className="text-sm text-primary/80 font-semibold mt-1">or Browse Files</p>
            <p className="text-xs text-muted mt-5">Supported : PDF, DOCX</p>
          </div>
          <button 
            onClick={() => document.getElementById('resume-upload-input').click()}
            disabled={status === 'analyzing'}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-display font-bold py-3.5 rounded-xl shadow-md shadow-primary/20 transition-all disabled:opacity-70 disabled:animate-pulse"
          >
            {status === 'analyzing' ? 'Analyzing...' : 'Analyze Resume'}
          </button>
          <input id="resume-upload-input" accept=".pdf,.docx,.txt" className="hidden" onChange={handleInputChange} type="file" />
        </div>

        {/* Card 2: Main Score */}
        <div className="rounded-3xl border border-hairline bg-canvas p-6 flex flex-col items-center shadow-sm relative h-[320px]">
          <h3 className="font-display font-bold text-ink text-base self-start">Resume Score</h3>
          <div className="flex-1 flex flex-col items-center justify-center w-full pt-4 pb-2">
            <ScoreRing score={atsScore} />
            {result && (
              <div className="mt-6 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className={`font-display text-xl font-bold ${atsScore >= 80 ? 'text-emerald-600' : atsScore >= 55 ? 'text-amber-500' : 'text-red-500'}`}>
                  {atsScore >= 80 ? 'Excellent' : atsScore >= 55 ? 'Good' : 'Needs Work'}
                </p>
                {atsScore >= 80 && (
                  <div className="text-4xl drop-shadow-sm leading-none">🏆</div>
                )}
              </div>
            )}
            {!result && (
              <div className="mt-6 flex flex-col items-center gap-2 opacity-30">
                <p className="font-display text-xl font-bold text-muted">Awaiting</p>
                <div className="text-4xl grayscale leading-none">🏆</div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Sub-scores */}
        <div className="rounded-3xl border border-hairline bg-canvas p-6 flex flex-col gap-3.5 shadow-sm h-[320px]">
          {[
            { label: 'ATS Score', value: atsScore, color: 'text-emerald-600' },
            { label: 'Grammar Score', value: grammarScore, color: 'text-emerald-600' },
            { label: 'Keyword Score', value: keywordScore, color: 'text-emerald-600' },
            { label: 'Formatting Score', value: formattingScore, color: 'text-emerald-600' },
          ].map((item, idx) => (
            <div key={idx} className="flex-1 flex items-center justify-between bg-surface-soft/60 rounded-2xl px-5 border border-hairline/50">
              <span className="text-sm font-semibold text-body">{item.label}</span>
              <span className={`text-lg font-display font-bold ${result ? item.color : 'text-muted'}`}>
                {result ? `${item.value}%` : '--'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ROW: 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        
        {/* AI Suggestions */}
        <div className="rounded-3xl border border-hairline bg-canvas p-8 shadow-sm min-h-[340px]">
          <h3 className="font-display font-bold text-ink text-lg mb-8">AI Suggestions</h3>
          <div className="space-y-6">
            {result ? result.suggestions.map((text, i) => (
              <div key={i} className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                <div className="mt-0.5 shrink-0 bg-emerald-500 rounded-full p-0.5">
                  <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <p className="text-[15px] text-ink font-medium leading-relaxed">
                  {/* Clean up the suggestion text to compress output as requested */}
                  {text.replace(/^.*?:/, '').trim()}
                </p>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                <FileText size={48} className="text-muted mb-4" />
                <p className="text-sm text-muted font-medium">Upload your resume to receive<br/>tailored AI improvement suggestions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Strengths & Highlights (Replaced Mock Document) */}
        <div className="rounded-3xl bg-indigo-50/80 border border-indigo-100/50 p-8 shadow-inner min-h-[340px]">
          <h3 className="font-display font-bold text-indigo-900 text-lg mb-6">Strengths & Highlights</h3>
          <div className="space-y-5">
            {result && result.strengths && result.strengths.length > 0 ? (
              result.strengths.map((text, i) => (
                <div key={i} className="flex items-start gap-3 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600"></div>
                  <p className="text-[15px] text-indigo-950 font-medium leading-relaxed">
                    {text.replace(/^.*?:/, '').trim()}
                  </p>
                </div>
              ))
            ) : result ? (
              <p className="text-sm text-indigo-900/60 font-medium">No specific highlights extracted.</p>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                <FileText size={48} className="text-indigo-900/40 mb-4" />
                <p className="text-sm text-indigo-900/60 font-medium">Upload your resume to see<br/>what you did excellent.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resume
