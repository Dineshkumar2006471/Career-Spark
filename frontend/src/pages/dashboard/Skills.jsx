/*
 * Skills renders the skill gap analyzer with visual progress indicators.
 * It exists to compare current skills against target role requirements.
 */
import { Target, BookOpen, Clock, AlertTriangle } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { fetchDashboardAnalysis } from '../../services/apiClient.js'
import { loadProfile, loadResumeVersions, loadRoadmap, loadSkillProgress } from '../../services/supabaseData.js'
import { buildDashboardPayload } from '../../services/careerAnalysis.js'

// ─── Pie Chart (pure CSS + SVG, no library) ─────────────────────────────────
const PIE_COLORS = [
  { fill: '#1652F0' },
  { fill: '#3B82F6' },
  { fill: '#10B981' },
  { fill: '#F59E0B' },
  { fill: '#EF4444' },
  { fill: '#8B5CF6' },
]

function polarToXY(cx, cy, radius, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  }
}

function PieChart({ categories }) {
  if (!categories.length) return null
  const totalScore = categories.reduce((sum, c) => sum + c.score, 0) || 1
  const cx = 120
  const cy = 120
  const rOuter = 100
  const rInner = 32 // sleek center hole for modern donut/pie hybrid look
  const avgScore = Math.round(totalScore / categories.length)

  let currentAngle = 0
  const slices = categories.map((cat, i) => {
    const sliceAngle = (cat.score / totalScore) * 360
    const startAngle = currentAngle
    let endAngle = currentAngle + sliceAngle
    if (endAngle - startAngle >= 360) endAngle = startAngle + 359.9
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

    const p1 = polarToXY(cx, cy, rOuter, startAngle)
    const p2 = polarToXY(cx, cy, rOuter, endAngle)
    const p3 = polarToXY(cx, cy, rInner, endAngle)
    const p4 = polarToXY(cx, cy, rInner, startAngle)

    const pathData = `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y} Z`

    currentAngle += sliceAngle
    return {
      ...cat,
      pathData,
      color: PIE_COLORS[i % PIE_COLORS.length],
      percentage: Math.round((cat.score / totalScore) * 100),
    }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-md py-xs">
      <div className="relative w-[220px] h-[220px] shrink-0">
        <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-sm">
          {slices.map((slice, i) => (
            <path
              key={i}
              d={slice.pathData}
              fill={slice.color.fill}
              stroke="var(--color-canvas)"
              strokeWidth="2.5"
              className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
            >
              <title>{slice.label}: {slice.score}% score ({slice.percentage}% share)</title>
            </path>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-2xl font-bold text-ink leading-none">{avgScore}%</span>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1">Avg Score</span>
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-xs">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-surface-soft transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: slice.color.fill }} />
              <span className="text-xs font-semibold text-ink truncate">{slice.label}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="font-mono text-xs font-bold text-ink">{slice.score}%</span>
              <span className="text-[10px] text-muted font-medium">({slice.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Skill Gap Bar (top section summary) ────────────────────────────────────
function SkillGapBar({ skill, score, maxScore = 100 }) {
  const [width, setWidth] = useState(0)
  const percent = Math.round((score / maxScore) * 100)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percent), 150)
    return () => clearTimeout(timer)
  }, [percent])

  const barColor = percent >= 80
    ? 'from-blue-500 to-blue-600'
    : percent >= 60
    ? 'from-indigo-500 to-indigo-600'
    : percent >= 40
    ? 'from-amber-500 to-amber-600'
    : 'from-rose-500 to-rose-600'

  return (
    <div className="flex items-center gap-base">
      <span className="w-[130px] shrink-0 text-sm font-medium text-ink truncate">{skill}</span>
      <div className="relative flex-1 h-3 rounded-full bg-surface-soft overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-[40px] text-right font-mono text-sm font-bold text-ink">{percent}%</span>
    </div>
  )
}

// ─── Derive chart categories from AI gaps ───────────────────────────────────
function deriveChartCategories(gaps) {
  const categoryMap = {
    Programming: ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'React', 'Node.js', 'HTML/CSS', 'React Native', 'Flutter', 'Solidity'],
    Database: ['SQL', 'Databases', 'MongoDB', 'PostgreSQL', 'Firebase', 'Redis', 'NoSQL', 'Data Preprocessing'],
    'Problem Solving': ['DSA', 'Algorithms', 'Data Structures', 'Problem Solving', 'Math & Statistics', 'Statistics', 'Cryptography', 'Game Physics'],
    Communication: ['Communication', 'Storytelling', 'Documentation', 'Stakeholder Management', 'Copywriting', 'Client Relations'],
    Leadership: ['Project Management', 'Agile/Scrum', 'Roadmapping', 'Team Leadership', 'Mentoring', 'Campaign Management'],
    'Cloud & DevOps': ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud Computing', 'Deployment', 'Linux', 'Terraform', 'AWS/GCP', 'Model Deployment'],
    'AI / ML': ['Machine Learning', 'Deep Learning', 'TensorFlow/PyTorch', 'NLP', 'AI', 'Computer Vision', 'Artificial Intelligence'],
    Design: ['Figma', 'UX research', 'Wireframes', 'Prototyping', 'Design systems', 'UI', 'Mobile UI', 'Wireframing', 'A/B Testing', '3D Modeling'],
  }

  const scores = {}
  const counts = {}

  for (const [category] of Object.entries(categoryMap)) {
    scores[category] = 0
    counts[category] = 0
  }

  for (const gap of gaps) {
    const skillLower = gap.skill.toLowerCase()
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(kw => skillLower.includes(kw.toLowerCase()) || kw.toLowerCase().includes(skillLower))) {
        scores[category] = (scores[category] || 0) + gap.current
        counts[category] = (counts[category] || 0) + 1
        break
      }
    }
  }

  const result = Object.entries(scores)
    .filter(([cat]) => counts[cat] > 0)
    .map(([label, total]) => ({
      label,
      score: Math.min(100, Math.round(total / counts[label])),
    }))

  if (result.length < 5) {
    const avg = result.length ? Math.round(result.reduce((s, c) => s + c.score, 0) / result.length) : 50
    const fillers = [
      { label: 'Programming', score: avg + 5 },
      { label: 'Problem Solving', score: avg - 5 },
      { label: 'Communication', score: avg },
      { label: 'Database', score: avg - 10 },
      { label: 'Leadership', score: avg - 15 },
    ]
    const existing = new Set(result.map(r => r.label))
    for (const filler of fillers) {
      if (result.length >= 6) break
      if (!existing.has(filler.label)) {
        result.push({ ...filler, score: Math.max(20, Math.min(95, filler.score)) })
        existing.add(filler.label)
      }
    }
  }

  return result.slice(0, 6)
}

// ─── Main Skills Component ──────────────────────────────────────────────────
function Skills() {
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    Promise.all([
      loadProfile(),
      loadRoadmap(),
      loadSkillProgress(),
      loadResumeVersions()
    ]).then(async ([prof, rdmp, skills, resumes]) => {
      try {
        const aiAnalysis = await fetchDashboardAnalysis(buildDashboardPayload(prof, rdmp, resumes))
        setAnalysis(aiAnalysis)
      } catch (err) {
        console.error("AI Analysis failed:", err)
        setAnalysis({ error: err.message || "AI Reasoning Engine is currently unavailable." })
      } finally {
        setIsAnalyzing(false)
      }
    }).catch(err => {
      console.error("Data load failed:", err)
      setIsAnalyzing(false)
    })
  }, [])

  // Derive data from the AI analysis
  const gaps = analysis?.gaps || []
  const chartCategories = useMemo(() => deriveChartCategories(gaps), [gaps])
  const weakSkills = useMemo(() => gaps.filter(g => g.priority === 'Critical' || g.priority === 'Important').map(g => g.skill), [gaps])
  const topCourses = useMemo(() => (analysis?.courses || []).slice(0, 3), [analysis])
  const estimatedMonths = useMemo(() => {
    if (!gaps.length) return '1 – 3'
    const avgGap = gaps.reduce((s, g) => s + g.gap, 0) / gaps.length
    if (avgGap > 50) return '6 – 12'
    if (avgGap > 30) return '3 – 6'
    return '1 – 3'
  }, [gaps])

  if (isAnalyzing) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500"></div>
        <p className="animate-pulse font-display text-sm font-semibold text-muted">Analyzing your skill gaps...</p>
      </div>
    )
  }

  if (!analysis || analysis.error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="font-display text-lg font-semibold text-red-500">Failed to analyze skill gaps.</p>
        <p className="text-sm text-muted">{analysis?.error || 'Please check your profile data or try again later.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-xl">
      {/* ─── Skill Intelligence Report Header ─────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas via-canvas to-primary/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-primary/8 to-transparent rounded-full -translate-y-1/4 translate-x-1/4"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-4">
            <Target size={14} /> Skill Intelligence Report
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">Analyze your skills, identify gaps and grow faster</h2>
          <p className="mt-xs text-sm text-body">AI-powered analysis for <span className="font-semibold text-ink">{analysis.targetRole}</span></p>
        </div>
      </section>

      {/* Pie Chart + Skill Gap Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Pie Chart Card */}
        <article className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm">
          <h3 className="font-display text-lg font-bold text-ink mb-md">Skill Distribution</h3>
          <PieChart categories={chartCategories} />
        </article>

        {/* Skill Gap Analysis Bars */}
        <article className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm">
          <h3 className="font-display text-lg font-bold text-ink mb-lg">Skill Gap Analysis</h3>
          <div className="space-y-md">
            {gaps.slice(0, 6).map((gap) => (
              <SkillGapBar key={gap.skill} skill={gap.skill} score={gap.current} maxScore={gap.target} />
            ))}
          </div>
        </article>
      </div>

      {/* Weak Skills / Recommended Courses / Estimated Time Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Weak Skills */}
        <article className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
          <div className="flex items-center gap-xs mb-md">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-rose-100">
              <AlertTriangle size={16} className="text-rose-600" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">Weak Skills</h3>
          </div>
          <div className="flex flex-wrap gap-xs">
            {weakSkills.length > 0 ? weakSkills.map(skill => (
              <span key={skill} className="inline-flex px-sm py-xxs rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                {skill}
              </span>
            )) : (
              <p className="text-sm text-muted">No critical weak skills detected!</p>
            )}
          </div>
        </article>

        {/* Recommended Courses */}
        <article className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
          <div className="flex items-center gap-xs mb-md">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100">
              <BookOpen size={16} className="text-blue-600" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">Recommended Courses</h3>
          </div>
          <div className="space-y-sm">
            {topCourses.length > 0 ? topCourses.map((course, i) => (
              <a key={i} href={course.url} target="_blank" rel="noreferrer" className="flex items-start gap-xs text-sm text-body hover:text-primary transition-colors group">
                <span className="mt-0.5 text-primary shrink-0">✓</span>
                <span className="group-hover:underline">{course.title}</span>
              </a>
            )) : (
              <p className="text-sm text-muted">Complete your profile to get recommendations.</p>
            )}
          </div>
        </article>

        {/* Estimated Learning Time */}
        <article className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
          <div className="flex items-center gap-xs mb-md">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-100">
              <Clock size={16} className="text-purple-600" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">Estimated Learning Time</h3>
          </div>
          <p className="font-display text-3xl font-bold text-ink">{estimatedMonths} <span className="text-lg text-muted">Months</span></p>
          <p className="mt-xs text-sm text-body">to become Industry Ready</p>
        </article>
      </div>

      {/* ─── Detailed Skill Gaps & Priorities ─────────────────────────────── */}
      <section className="space-y-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-xl font-bold text-ink">Detailed Skill Gaps & Priorities</h3>
            <p className="text-sm text-body">Ranked like a hiring screen: missing proof first, then skills needing stronger projects, then polish items.</p>
          </div>
          <span className="inline-flex items-center self-start sm:self-auto text-xs font-semibold text-muted bg-surface-soft px-3 py-1 rounded-full">{gaps.length} Skills Tracked</span>
        </div>
        <div className="grid gap-base lg:grid-cols-2">
          {gaps.map((item) => {
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
        </div>
      </section>
    </div>
  )
}

export default Skills
