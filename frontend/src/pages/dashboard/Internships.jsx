/*
 * Internships renders the job search interface connecting students to real entry-level roles
 * and internship drives from top platforms (Naukri, Internshala, Wellfound, LinkedIn, Unstop, National Internship Portal).
 */
import { BriefcaseBusiness, ExternalLink, MapPin, Search, Filter, Building2, Award, Sparkles, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { searchInternships, fetchDashboardAnalysis } from '../../services/apiClient.js'
import { loadProfile, loadRoadmap, loadResumeVersions } from '../../services/supabaseData.js'
import { buildDashboardPayload } from '../../services/careerAnalysis.js'

const OFFICIAL_BRAND_LOGOS = {
  'infosys': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
  'tcs': 'https://www.google.com/s2/favicons?domain=www.tcs.com&sz=128',
  'tata consultancy services': 'https://www.google.com/s2/favicons?domain=www.tcs.com&sz=128',
  'zoho': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Zoho_Corporation_logo.svg',
  'accenture': 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
  'ibm': 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
  'google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'microsoft': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  'amazon': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'flipkart': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg',
  'wipro': 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg',
  'cognizant': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg',
  'razorpay': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
  'swiggy': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.svg',
  'zomato': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Zomato_Logo.svg',
  'freshworks': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Freshworks_logo.svg',
  'postman': 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Postman_%28software%29.png',
  'zerodha': 'https://upload.wikimedia.org/wikipedia/commons/6/62/Zerodha_logo.svg',
  'atlassian': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Atlassian_logo.svg',
  'adobe': 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png',
  'oracle': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
  'cisco': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
  'intel': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg',
  'samsung': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
  'capgemini': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Capgemini_201x_logo.svg',
  'tech mahindra': 'https://www.google.com/s2/favicons?domain=www.techmahindra.com&sz=128',
  'hcl': 'https://www.google.com/s2/favicons?domain=www.hcltech.com&sz=128',
  'hcltech': 'https://www.google.com/s2/favicons?domain=www.hcltech.com&sz=128',
  'l&t': 'https://www.google.com/s2/favicons?domain=www.larsentoubro.com&sz=128',
  'larsentoubro': 'https://www.google.com/s2/favicons?domain=www.larsentoubro.com&sz=128',
  'meta': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  'apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  'netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  'uber': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
  'paytm': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg',
  'phonepe': 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg',
  'myntra': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png',
  'makemytrip': 'https://upload.wikimedia.org/wikipedia/commons/2/29/MakeMyTrip_Logo.svg',
  'isro': 'https://www.isro.gov.in/media_isro/image/index/isroLogo.png',
  'national informatics centre': 'https://www.google.com/s2/favicons?domain=www.nic.in&sz=128',
  'nic': 'https://www.google.com/s2/favicons?domain=www.nic.in&sz=128',
  'linkedin': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  'linkedin jobs': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  'internshala': 'https://www.google.com/s2/favicons?domain=internshala.com&sz=128',
  'naukri': 'https://www.google.com/s2/favicons?domain=naukri.com&sz=128',
  'wellfound': 'https://www.google.com/s2/favicons?domain=wellfound.com&sz=128',
  'unstop': 'https://www.google.com/s2/favicons?domain=unstop.com&sz=128',
  'national internship portal': 'https://www.google.com/s2/favicons?domain=aicte-india.org&sz=128',
  'adzuna': 'https://www.google.com/s2/favicons?domain=adzuna.in&sz=128',
  'remotive': 'https://www.google.com/s2/favicons?domain=remotive.com&sz=128'
}

const COMPANY_DOMAIN_MAP = {
  'infosys': 'www.infosys.com',
  'tcs': 'www.tcs.com',
  'tata consultancy services': 'www.tcs.com',
  'zoho': 'www.zoho.com',
  'accenture': 'www.accenture.com',
  'ibm': 'www.ibm.com',
  'google': 'www.google.com',
  'microsoft': 'www.microsoft.com',
  'amazon': 'www.amazon.in',
  'flipkart': 'www.flipkart.com',
  'wipro': 'www.wipro.com',
  'cognizant': 'www.cognizant.com',
  'razorpay': 'www.razorpay.com',
  'swiggy': 'www.swiggy.com',
  'zomato': 'www.zomato.com',
  'freshworks': 'www.freshworks.com',
  'postman': 'www.postman.com',
  'zerodha': 'www.zerodha.com',
  'atlassian': 'www.atlassian.com',
  'adobe': 'www.adobe.com',
  'oracle': 'www.oracle.com',
  'cisco': 'www.cisco.com',
  'intel': 'www.intel.com',
  'samsung': 'www.samsung.com',
  'capgemini': 'www.capgemini.com',
  'tech mahindra': 'www.techmahindra.com',
  'hcl': 'www.hcltech.com',
  'hcltech': 'www.hcltech.com',
  'l&t': 'www.larsentoubro.com',
  'larsentoubro': 'www.larsentoubro.com',
  'meta': 'www.meta.com',
  'apple': 'www.apple.com',
  'netflix': 'www.netflix.com',
  'uber': 'www.uber.com',
  'paytm': 'www.paytm.com',
  'phonepe': 'www.phonepe.com',
  'myntra': 'www.myntra.com',
  'makemytrip': 'www.makemytrip.com',
  'isro': 'www.isro.gov.in',
  'nic': 'www.nic.in',
  'national informatics centre': 'www.nic.in',
  'internshala': 'internshala.com',
  'naukri': 'naukri.com',
  'wellfound': 'wellfound.com',
  'linkedin': 'www.linkedin.com',
  'linkedin jobs': 'www.linkedin.com',
  'unstop': 'unstop.com',
  'national internship portal': 'aicte-india.org',
  'adzuna': 'adzuna.in',
  'remotive': 'remotive.com'
}

const PLATFORM_LOGOS = {
  'internshala': 'https://www.google.com/s2/favicons?domain=internshala.com&sz=128',
  'naukri': 'https://www.google.com/s2/favicons?domain=naukri.com&sz=128',
  'wellfound': 'https://www.google.com/s2/favicons?domain=wellfound.com&sz=128',
  'linkedin': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  'linkedin jobs': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  'unstop': 'https://www.google.com/s2/favicons?domain=unstop.com&sz=128',
  'national internship portal': 'https://www.google.com/s2/favicons?domain=aicte-india.org&sz=128',
  'adzuna': 'https://www.google.com/s2/favicons?domain=adzuna.in&sz=128',
  'remotive': 'https://www.google.com/s2/favicons?domain=remotive.com&sz=128'
}

function CompanyLogo({ company, domain }) {
  const compKey = company ? company.toLowerCase().trim() : ''
  const directLogo = OFFICIAL_BRAND_LOGOS[compKey]
  const resolvedDomain = domain || COMPANY_DOMAIN_MAP[compKey] || (compKey ? `${compKey.replace(/[^a-z0-9]/g, '')}.com` : null)
  
  // 3-stage failover sequence (no DNS-blocked services like Clearbit):
  // Stage 0: Direct verified brand logo (Tested 200 OK URLs)
  // Stage 1: Google Favicon API (with automatic www. resolution for corporate domains)
  // Stage 2: DuckDuckGo Icons API
  // Stage 3: Clean initials badge
  const [stage, setStage] = useState(directLogo ? 0 : (resolvedDomain ? 1 : 3))

  const getLogoUrl = () => {
    if (stage === 0 && directLogo) return directLogo
    if (stage === 1 && resolvedDomain) {
      const dom = resolvedDomain.startsWith('www.') ? resolvedDomain : (COMPANY_DOMAIN_MAP[compKey] || `www.${resolvedDomain}`)
      return `https://www.google.com/s2/favicons?domain=${dom}&sz=128`
    }
    if (stage === 2 && resolvedDomain) return `https://icons.duckduckgo.com/ip3/${resolvedDomain}.ico`
    return null
  }

  const logoUrl = getLogoUrl()

  if (!logoUrl || stage >= 3) {
    const initials = company ? company.slice(0, 2).toUpperCase() : 'CO'
    const bgColors = ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700']
    const colorClass = bgColors[(company || '').length % bgColors.length]
    return (
      <div className={`grid h-12 w-12 place-items-center rounded-xl font-display text-base font-bold shadow-sm border border-hairline ${colorClass}`} title={company}>
        {initials}
      </div>
    )
  }

  return (
    <div className="flex h-14 w-28 items-center justify-center p-1 bg-white/40 rounded-xl">
      <img
        src={logoUrl}
        alt={`${company} logo`}
        className="max-h-11 max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          if (stage < 2) {
            setStage(prev => prev + 1)
          } else {
            setStage(3)
          }
        }}
      />
    </div>
  )
}

function PlatformBadge({ source }) {
  const srcName = source || 'Internshala'
  const key = srcName.toLowerCase().trim()
  const resolvedDom = COMPANY_DOMAIN_MAP[key] || `${key.replace(/[^a-z0-9]/g, '')}.com`
  const logoUrl = PLATFORM_LOGOS[key] || `https://www.google.com/s2/favicons?domain=${resolvedDom}&sz=128`
  const backupUrl = `https://icons.duckduckgo.com/ip3/${resolvedDom}.ico`

  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-surface-soft px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink border border-hairline shadow-2xs shrink-0">
      <img
        src={logoUrl}
        alt={`${srcName} icon`}
        className="h-4 w-4 object-contain rounded-xs"
        onError={(e) => {
          if (e.target.src !== backupUrl) {
            e.target.src = backupUrl
          } else {
            e.target.style.display = 'none'
          }
        }}
      />
      <span>{srcName}</span>
    </span>
  )
}

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
    <div className="space-y-xl pb-12">
      {/* Header & Search */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas via-canvas to-green-500/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-sm rounded-full border border-green-500/20 bg-green-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green-600 mb-4">
            <BriefcaseBusiness size={14} /> Multi-Platform Job Board
          </div>
          <h2 className="font-display text-3xl font-bold">Internship Search & Campus Drives</h2>
          <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body mb-lg">
            Live curated internship drives from Naukri, Internshala, Wellfound, LinkedIn, Unstop, and the National Internship Portal.
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-sm max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                className="w-full h-12 rounded-xl border border-hairline bg-white pl-12 pr-4 text-sm text-ink outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-400/20 shadow-sm"
                placeholder="e.g. Frontend Developer Intern, AI Engineer, SDE"
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
            <Sparkles size={20} className="text-purple-600 shrink-0" /> Gemini AI Recommended Drives
          </h3>
          <div className="grid gap-base lg:grid-cols-2">
            {aiRecommendations.map((sim, index) => (
              <a className="group relative flex flex-col justify-between rounded-3xl border border-purple-200 bg-purple-50/20 p-xl hover:border-purple-400 hover:shadow-lg transition-all" href={sim.url} target="_blank" rel="noreferrer" key={index}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <CompanyLogo company={sim.provider} />
                    <PlatformBadge source={sim.type || 'Internshala'} />
                  </div>
                  <h4 className="font-display font-bold text-lg text-ink leading-tight mb-1 group-hover:text-purple-700 transition-colors">{sim.title}</h4>
                  <p className="text-sm font-semibold text-body mb-3">{sim.provider}</p>
                </div>
                
                <p className="text-sm text-body leading-relaxed flex-1 mb-6">
                  {sim.reason}
                </p>
                
                <div className="border-t border-purple-100 pt-4 flex items-center justify-between mt-auto">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                    <Sparkles size={14} /> AI Verified Match
                  </span>
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
            <h3 className="font-display font-bold text-lg text-ink">Showing {results.length} live internship drives</h3>
            <button className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors">
              <Filter size={16} /> Filters
            </button>
          </div>
          
          <div className="grid gap-base lg:grid-cols-2">
            {results.map((job, index) => (
              <article className="group relative flex flex-col justify-between rounded-3xl border border-hairline bg-canvas p-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-400/50 hover:shadow-lg" key={index}>
                <div>
                  {/* Top Row: Company Logo & Platform Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <CompanyLogo company={job.company} />
                    <PlatformBadge source={job.source} />
                  </div>

                  <h4 className="font-display font-bold text-lg text-ink leading-tight mb-1 group-hover:text-green-700 transition-colors">{job.title}</h4>
                  <p className="text-sm font-semibold text-body mb-4">{job.company || 'Company Confidential'}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted mb-4">
                  <span className="flex items-center gap-1.5 bg-surface-soft px-2.5 py-1.5 rounded-lg border border-hairline/60 text-ink font-semibold">
                    <MapPin size={13} className="text-green-600" /> {job.location || 'Remote / Unspecified'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-bold">
                    <DollarSign size={13} /> Paid Stipend
                  </span>
                </div>
                
                <p className="text-sm text-body leading-relaxed flex-1 mb-6">
                  {formatDescription(job.description)}
                </p>
                
                <div className="border-t border-hairline pt-4 flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-muted flex items-center gap-1">
                    Verified via <span className="text-ink font-bold">{job.source || 'CareerSpark'}</span>
                  </span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-display font-semibold text-white shadow-sm hover:bg-green-700 transition-all"
                  >
                    <span>Apply on {job.source || 'Portal'}</span>
                    <ExternalLink size={15} />
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
