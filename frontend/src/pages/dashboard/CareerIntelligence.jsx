/*
 * CareerIntelligence renders AI-powered career market analysis with compatibility scores,
 * industry demand forecasts, salary estimates, and personalized AI suggestions.
 * It exists as the career intelligence hub powered by Gemini 2.5 Flash.
 */
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Target, TrendingUp, DollarSign, Briefcase, BarChart3, Lightbulb, RefreshCw, Sparkles, ArrowRight, ChevronUp } from 'lucide-react'
import { fetchCareerIntelligence } from '../../services/apiClient.js'
import { loadProfile, loadRoadmap, loadSkillProgress } from '../../services/supabaseData.js'

// Color palette for the compatibility progress bars
const BAR_COLORS = [
  'from-blue-500 to-blue-600',
  'from-indigo-500 to-indigo-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
]

// Static fallback data so the UI looks great even before the AI responds
const FALLBACK = {
  compatibility: [
    { role: 'Software Developer', match_percentage: 92 },
    { role: 'Data Analyst', match_percentage: 88 },
    { role: 'AI Engineer', match_percentage: 86 },
    { role: 'Cloud Engineer', match_percentage: 84 },
    { role: 'Cyber Security', match_percentage: 81 },
  ],
  industry_demand: [
    { year: '2024', demand_index: 55, growth_label: null },
    { year: '2025', demand_index: 62, growth_label: null },
    { year: '2026', demand_index: 70, growth_label: null },
    { year: '2027', demand_index: 80, growth_label: null },
    { year: '2028', demand_index: 92, growth_label: '+20% Growth' },
  ],
  growth_badge: '+20% Growth',
  expected_salary: '₹6.5 – 12 LPA',
  salary_subtitle: 'for Software Developer',
  job_opportunities: '1.8M+',
  opportunities_subtitle: 'Across India',
  growth_rate: 'High',
  ai_suggestion: 'Based on your profile, AI recommends strengthening Python and Cloud Computing to get higher opportunities.',
}

// Animated progress bar for career compatibility
function CompatibilityBar({ role, percentage, colorClass, delay = 0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100 + delay)
    return () => clearTimeout(timer)
  }, [percentage, delay])

  return (
    <div className="flex items-center gap-base group">
      <span className="w-[140px] shrink-0 text-sm font-medium text-ink truncate">{role}</span>
      <div className="relative flex-1 h-3 rounded-full bg-surface-soft overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-[42px] text-right font-mono text-sm font-bold text-ink">{percentage}%</span>
    </div>
  )
}

// Industry demand bar chart — uses pixel heights so bars are visually distinct
const CHART_MAX_HEIGHT_PX = 150

function DemandChart({ data }) {
  const maxDemand = Math.max(...data.map(d => d.demand_index), 1)
  return (
    <div className="flex items-end justify-between gap-sm" style={{ height: `${CHART_MAX_HEIGHT_PX + 60}px` }}>
      {data.map((point, i) => {
        const barHeight = Math.max(16, Math.round((point.demand_index / maxDemand) * CHART_MAX_HEIGHT_PX))
        return (
          <div key={point.year} className="flex flex-col items-center justify-end flex-1 h-full gap-xs">
            {point.growth_label && (
              <span className="px-xs py-xxs rounded-md bg-emerald-500 text-[10px] font-bold text-white whitespace-nowrap shadow-sm animate-bounce">
                {point.growth_label}
              </span>
            )}
            <div
              className="w-10 rounded-t-lg bg-gradient-to-t from-primary to-blue-400 transition-all duration-700 ease-out hover:from-primary-hover hover:to-blue-300 cursor-default relative group"
              style={{ height: `${barHeight}px` }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-ink text-white text-[10px] px-xs py-xxs rounded-md whitespace-nowrap shadow-md">
                {point.demand_index}
              </div>
            </div>
            <span className="text-xs font-medium text-muted">{point.year}</span>
          </div>
        )
      })}
    </div>
  )
}

// Stat card component for salary, opportunities, growth rate
function StatCard({ icon: Icon, title, value, subtitle, valueColor = 'text-ink' }) {
  return (
    <article className="rounded-2xl border border-hairline bg-canvas p-lg transition-all hover:-translate-y-0.5 hover:shadow-float group">
      <div className="flex items-center gap-xs mb-sm">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
          <Icon size={16} className="text-primary" />
        </div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">{title}</p>
      </div>
      <p className={`font-display text-2xl font-bold leading-tight ${valueColor}`}>{value}</p>
      <p className="mt-xxs text-xs text-body">{subtitle}</p>
    </article>
  )
}

const CACHE_KEY = 'careerspark_intelligence_cache'

// Renders the Career Intelligence page.
function CareerIntelligence() {
  // Try to restore cached data so returning to this page is instant
  const [data, setData] = useState(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const hasAutoFetched = useRef(false)

  // Auto-fetch only once per session
  useEffect(() => {
    if (hasAutoFetched.current) return
    hasAutoFetched.current = true
    runAnalysis(false)
  }, [])

  // Called on first load (no cache) or when user clicks "Refresh Analysis"
  async function runAnalysis(forceRefresh = true) {
    setLoading(true)
    setError(null)
    try {
      const [profile, roadmap, skills] = await Promise.all([
        loadProfile().catch(() => null),
        loadRoadmap().catch(() => null),
        loadSkillProgress().catch(() => []),
      ])

      const targetRole = roadmap?.career_path || profile?.target_role || JSON.parse(localStorage.getItem('careerspark_path') || '{}')?.title || 'Software Developer'
      const profileSkills = [
        ...(profile?.skills || []),
        ...(skills || []).map(s => s.skill_name || s.name).filter(Boolean),
      ]

      const dynamicCacheKey = `${CACHE_KEY}_${profile?.id || 'default'}_${targetRole.replace(/[^a-zA-Z0-9]/g, '_')}`

      if (!forceRefresh) {
        const cached = localStorage.getItem(dynamicCacheKey)
        if (cached) {
          setData(JSON.parse(cached))
          setLoaded(true)
          setLoading(false)
          return
        }
      }

      const payload = {
        target_role: targetRole,
        profile_skills: profileSkills,
        projects: profile?.projects || [],
        experience: profile?.experience || [],
        location: profile?.location || null,
        goal_note: profile?.goal_note || null,
      }

      const result = await fetchCareerIntelligence(payload)
      setData(result)
      setLoaded(true)
      // Persist to localStorage so navigating away and back is instant for this role
      try { localStorage.setItem(dynamicCacheKey, JSON.stringify(result)) } catch {}
    } catch (err) {
      console.error('Career Intelligence fetch error:', err)
      setError(err.message || 'Failed to load career intelligence')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-lg animate-[fadeIn_0.4s_ease-out]">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0E14] via-[#1a1f2e] to-[#1652F0] p-xl text-white">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-48 bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-2xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-sm mb-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Sparkles size={20} className="text-blue-300" />
              </div>
              <span className="px-sm py-xxs rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-blue-200 border border-white/10">
                AI Powered
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight">Career Intelligence</h1>
            <p className="mt-xs text-sm text-blue-200/80 max-w-lg">
              AI analyzes your profile and predicts your best career opportunities with real-time market intelligence.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-sm">
            <button
              className={`inline-flex h-10 items-center gap-xs rounded-xl px-md text-sm font-semibold transition-all ${
                loading
                  ? 'bg-white/10 text-blue-200 cursor-wait'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/10'
              }`}
              disabled={loading}
              onClick={runAnalysis}
              type="button"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Analyzing…' : 'Refresh Analysis'}
            </button>
          </div>
        </div>
        {/* Mobile refresh button */}
        <button
          className={`sm:hidden mt-md inline-flex h-10 items-center gap-xs rounded-xl px-md text-sm font-semibold transition-all ${
            loading
              ? 'bg-white/10 text-blue-200 cursor-wait'
              : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/10'
          }`}
          disabled={loading}
          onClick={runAnalysis}
          type="button"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing…' : 'Refresh Analysis'}
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-lg py-md text-sm text-amber-800">
          <strong>Note:</strong> {error} — Showing sample data below.
        </div>
      )}

      {/* Main Grid: Compatibility + Industry Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Career Compatibility Card */}
        <article className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm hover:shadow-float transition-shadow">
          <div className="flex items-center justify-between mb-lg">
            <div className="flex items-center gap-sm">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10">
                <Target size={18} className="text-primary" />
              </div>
              <h2 className="font-display text-lg font-bold text-ink">Career Compatibility</h2>
            </div>
            {loaded && (
              <span className="px-xs py-xxs rounded-md bg-emerald-100 text-[10px] font-bold text-emerald-700">
                AI Analyzed
              </span>
            )}
          </div>
          <div className="space-y-md">
            {data.compatibility.map((item, i) => (
              <CompatibilityBar
                key={item.role}
                role={item.role}
                percentage={item.match_percentage}
                colorClass={BAR_COLORS[i % BAR_COLORS.length]}
                delay={i * 120}
              />
            ))}
          </div>
        </article>

        {/* Industry Demand Card */}
        <article className="rounded-2xl border border-hairline bg-canvas p-xl shadow-sm hover:shadow-float transition-shadow">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-sm">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10">
                <BarChart3 size={18} className="text-primary" />
              </div>
              <h2 className="font-display text-lg font-bold text-ink">Industry Demand</h2>
            </div>
            <span className="px-sm py-xxs rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 flex items-center gap-xxs">
              <ChevronUp size={12} />
              {data.growth_badge}
            </span>
          </div>
          <DemandChart data={data.industry_demand} />
        </article>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
        <StatCard
          icon={DollarSign}
          title="Expected Salary"
          value={data.expected_salary}
          subtitle={data.salary_subtitle}
        />
        <StatCard
          icon={Briefcase}
          title="Job Opportunities"
          value={data.job_opportunities}
          subtitle={data.opportunities_subtitle}
        />
        <StatCard
          icon={TrendingUp}
          title="Growth Rate"
          value={data.growth_rate}
          subtitle="5-year market trajectory"
          valueColor={data.growth_rate === 'High' ? 'text-emerald-600' : data.growth_rate === 'Medium' ? 'text-amber-600' : 'text-rose-600'}
        />
      </div>

      {/* AI Suggestion Banner */}
      <article className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-blue-50/50 to-primary/5 p-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-lg">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-blue-400 shadow-md">
            <Lightbulb size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-ink flex items-center gap-xs">
              <Sparkles size={14} className="text-primary" />
              AI Suggestion
            </h3>
            <p className="mt-xs text-sm text-body leading-relaxed">{data.ai_suggestion}</p>
          </div>
          <Link
            className="inline-flex h-11 items-center gap-xs rounded-xl border-2 border-primary bg-transparent px-md text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all shrink-0"
            to="/dashboard/learning-path"
          >
            Explore Learning Path
            <ArrowRight size={14} />
          </Link>
        </div>
      </article>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-md rounded-2xl bg-canvas p-xl shadow-float border border-hairline">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
              <RefreshCw size={28} className="text-primary animate-spin" />
            </div>
            <p className="font-display text-base font-bold text-ink">Analyzing Career Intelligence…</p>
            <p className="text-sm text-muted">Gemini AI is processing your profile</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}

export default CareerIntelligence
