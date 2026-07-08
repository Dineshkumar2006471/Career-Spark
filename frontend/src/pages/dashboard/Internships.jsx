/*
 * Internships renders the job search interface connecting students to real entry-level roles.
 * It exists to bridge the gap between learning and applying.
 */
import { BriefcaseBusiness, ExternalLink, MapPin, Search, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { searchInternships, fetchDashboardAnalysis } from '../../services/apiClient.js'
import { loadProfile, loadRoadmap, loadResumeVersions } from '../../services/supabaseData.js'
import { buildDashboardPayload } from '../../services/careerAnalysis.js'

function Internships() {
  const [profile, setProfile] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState([])

  // Use the profile goal note as the initial search query, fallback to local storage
  useEffect(() => {
    Promise.all([
      loadProfile(),
      loadRoadmap(),
      loadResumeVersions()
    ]).then(async ([p, rdmp, resumes]) => {
      setProfile(p)
      const targetRole = p?.goal_note || rdmp?.career_path || "Entry Level"
      if (p?.goal_note) {
        setQuery(`${p.goal_note} intern`)
      } else {
        const storedPath = JSON.parse(localStorage.getItem('careerspark_path') || '{}')
        if (storedPath.title) setQuery(`${storedPath.title} intern`)
      }
      
      // Load AI recommendations
      try {
        const analysis = await fetchDashboardAnalysis(buildDashboardPayload(p, rdmp, resumes))
        if (analysis && analysis.simulations) {
          setAiRecommendations(analysis.simulations)
        }
      } catch (e) {
        console.error("Failed to fetch AI recommendations", e)
      }
    }).catch(() => {})
  }, [])

  // Auto-search once query is populated from profile
  useEffect(() => {
    if (query && !hasSearched && !loading) {
      handleSearch(new Event('submit'))
    }
  }, [query, hasSearched, loading])

  async function handleSearch(e) {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setHasSearched(true)
    
    try {
      // Backend expects page=1, size=10, query
      const data = await searchInternships({ query, page: 1, size: 12 })
      setResults(data.items || [])
    } catch (err) {
      setError('Failed to load internships. Please try again later.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Format description to look clean
  const formatDescription = (desc) => {
    if (!desc) return ''
    const clean = desc.replace(/<[^>]*>?/gm, '') // strip HTML
    return clean.length > 150 ? clean.substring(0, 150) + '...' : clean
  }

  return (
    <div className="space-y-xl">
      {/* Header & Search */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas via-canvas to-green-500/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-sm rounded-full border border-green-500/20 bg-green-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green-600 mb-4">
            <BriefcaseBusiness size={14} /> Job Board
          </div>
          <h2 className="font-display text-3xl font-bold">Internship Search</h2>
          <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body mb-lg">Live listings from Adzuna filtered for entry-level and internship roles matching your career goals.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-sm max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                className="w-full h-12 rounded-xl border border-hairline bg-white pl-12 pr-4 text-sm text-ink outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-400/20 shadow-sm"
                placeholder="e.g. Frontend Developer Intern"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="h-12 px-8 rounded-xl bg-ink text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Searching...
                </>
              ) : (
                'Find Roles'
              )}
            </button>
          </form>
        </div>
      </section>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <section className="mb-xl">
          <h3 className="font-display font-bold text-lg text-ink mb-base flex items-center gap-2">
            <span className="text-purple-600">✨</span> Gemini AI Recommended
          </h3>
          <div className="grid gap-base lg:grid-cols-2">
            {aiRecommendations.map((sim, index) => (
              <a className="group flex flex-col rounded-2xl border border-purple-200 bg-purple-50/30 p-lg hover:border-purple-400 hover:shadow-md transition-all" href={sim.url} target="_blank" rel="noreferrer" key={index}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-display font-bold text-lg text-ink leading-tight mb-1 group-hover:text-purple-700 transition-colors">{sim.title}</h4>
                    <p className="text-sm font-semibold text-body">{sim.provider}</p>
                  </div>
                  <span className="inline-flex rounded-lg bg-purple-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 border border-purple-200 whitespace-nowrap">
                    {sim.type || 'Simulation'}
                  </span>
                </div>
                
                <p className="text-sm text-body leading-relaxed flex-1 mb-6">
                  {sim.reason}
                </p>
                
                <div className="border-t border-purple-100 pt-4 flex items-center justify-between mt-auto">
                  <span className="text-xs text-muted">AI Match</span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700">
                    Apply Now <ExternalLink size={16} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-base text-red-600 text-sm">
          {error}
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && !error && (
        <div className="rounded-2xl border-2 border-dashed border-hairline p-xl text-center text-body">
          No internships found for "{query}". Try broadening your search terms.
        </div>
      )}

      {results.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-base">
            <h3 className="font-display font-bold text-lg text-ink">Showing {results.length} live roles</h3>
            <button className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors">
              <Filter size={16} /> Filters
            </button>
          </div>
          
          <div className="grid gap-base lg:grid-cols-2">
            {results.map((job, index) => (
              <article className="group flex flex-col rounded-2xl border border-hairline bg-canvas p-lg hover:border-green-300 hover:shadow-md transition-all" key={index}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-display font-bold text-lg text-ink leading-tight mb-1 group-hover:text-green-700 transition-colors">{job.title}</h4>
                    <p className="text-sm font-semibold text-body">{job.company || 'Company Confidential'}</p>
                  </div>
                  <span className="inline-flex rounded-lg bg-surface-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted border border-hairline whitespace-nowrap">
                    {job.source || 'Adzuna'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium text-muted mb-4">
                  <span className="flex items-center gap-1 bg-surface-soft px-2 py-1 rounded-md">
                    <MapPin size={12} /> {job.location || 'Remote / Unspecified'}
                  </span>
                </div>
                
                <p className="text-sm text-body leading-relaxed flex-1 mb-6">
                  {formatDescription(job.description)}
                </p>
                
                <div className="border-t border-hairline pt-4 flex items-center justify-between mt-auto">
                  <span className="text-xs text-muted">via CareerSpark</span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
                  >
                    View details <ExternalLink size={16} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Internships
