/*
 * JobRecommendations renders AI-curated job opportunities and placement drives
 * from top tech companies and startups based on the student's skills, experience, and ATS resume score.
 */
import { useState, useEffect, useMemo } from 'react'
import { Briefcase, Search, MapPin, DollarSign, Calendar, CheckCircle, FileText, Target, RefreshCw, ExternalLink, Building2, Clock, Sparkles, Filter, Award } from 'lucide-react'
import { fetchJobRecommendations } from '../../services/apiClient.js'
import { loadProfile, loadRoadmap, loadResumeVersions } from '../../services/supabaseData.js'
import { getTargetRole } from '../../services/careerAnalysis.js'

const CACHE_KEY = 'careerspark_jobs_cache'

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

function JobCard({ job }) {
  const isHighMatch = job.match_percentage >= 90
  const isMediumMatch = job.match_percentage >= 80 && job.match_percentage < 90

  return (
    <article className="group relative flex flex-col justify-between rounded-3xl border border-hairline bg-canvas p-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div>
        {/* Header: Company Logo & Work Mode Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <CompanyLogo company={job.company} domain={job.domain} />
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            job.work_mode === 'Remote' || job.work_mode === 'Virtual' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
            job.work_mode === 'On Campus' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {job.work_mode}
          </span>
        </div>

        {/* Role Title & Company Name */}
        <div className="text-center sm:text-left mb-4">
          <h3 className="font-display text-lg font-bold text-ink group-hover:text-primary transition-colors line-clamp-1">
            {job.title}
          </h3>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">{job.company}</p>
        </div>

        {/* Location & Experience Info */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-body mb-4 bg-surface-soft/60 p-2.5 rounded-xl border border-hairline">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-muted shrink-0" />
            <span className="truncate max-w-[120px]">{job.location}</span>
          </div>
          <span className="text-hairline">|</span>
          <div className="flex items-center gap-1">
            <Briefcase size={14} className="text-muted shrink-0" />
            <span>{job.experience}</span>
          </div>
        </div>

        {/* Salary & AI Match Row */}
        <div className="flex items-center justify-between gap-2 mb-4 px-1">
          <div className="flex items-center gap-1 font-mono text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
            <DollarSign size={14} className="-mr-0.5" />
            <span>{job.salary}</span>
          </div>
          
          <div className="flex items-center gap-1 font-display text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20">
            <Sparkles size={13} className="text-primary animate-pulse" />
            <span>AI Match {job.match_percentage}%</span>
          </div>
        </div>

        {/* Match Reason */}
        <p className="text-xs leading-relaxed text-body mb-6 line-clamp-2 italic bg-surface-soft/40 p-2 rounded-lg border border-hairline/50">
          "{job.match_reason}"
        </p>
      </div>

      {/* Footer: Apply Button & Deadline */}
      <div className="space-y-3 pt-2 border-t border-hairline">
        <a
          href={job.apply_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary text-white font-display text-sm font-semibold shadow-sm hover:bg-primary/90 hover:shadow transition-all active:scale-[0.99]"
        >
          <span>Apply Now</span>
          <ExternalLink size={15} />
        </a>

        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-center">
          <Clock size={13} className={job.deadline.includes('Days Left') ? 'text-amber-600' : 'text-primary'} />
          <span className={job.deadline.includes('Days Left') ? 'text-amber-700' : 'text-muted'}>
            {job.deadline}
          </span>
        </div>
      </div>
    </article>
  )
}

function JobRecommendations() {
  const [jobsData, setJobsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)

  // Filters state
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [selectedSalary, setSelectedSalary] = useState('All')

  const fetchJobs = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setJobsData(parsed)
          setLoading(false)
          return
        } catch (e) {
          console.error("Cache parse error:", e)
        }
  const fetchJobs = async (forceRefetch = false) => {
    try {
      setLoading(true)
      if (forceRefetch) setRefreshing(true)

      setError(null)

      const [prof, rdmp, resumes] = await Promise.all([
        loadProfile(),
        loadRoadmap(),
        loadResumeVersions()
      ])

      if (prof) setProfile(prof)
      const targetRole = getTargetRole(prof, rdmp, null)
      const resumeScore = resumes?.[0]?.ats_score || prof?.resume_feedback?.score || 75

      // Make cache key dynamic to the specific profile and target role
      const dynamicCacheKey = `${CACHE_KEY}_${prof?.id || 'default'}_${targetRole.replace(/[^a-zA-Z0-9]/g, '_')}`
      
      const cached = localStorage.getItem(dynamicCacheKey)
      if (!forceRefetch && cached) {
        setJobsData(JSON.parse(cached))
        setLoading(false)
        if (forceRefetch) setRefreshing(false)
        return
      }

      const payload = {
        target_role: targetRole,
        profile_skills: prof?.skills || [],
        projects: prof?.projects || [],
        experience: prof?.experience_items || [],
        location: prof?.city ? `${prof.city}, ${prof.state || 'India'}` : 'India',
        resume_score: resumeScore
      }

      const res = await fetchJobRecommendations(payload)
      setJobsData(res)
      localStorage.setItem(dynamicCacheKey, JSON.stringify(res))
    } catch (err) {
      console.error("Job recommendations fetch failed:", err)
      setError(err.message || "Failed to load job recommendations. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchJobs(false)
  }, [])

  // Derive unique locations for filter dropdown
  const availableLocations = useMemo(() => {
    if (!jobsData?.jobs) return []
    const locs = new Set(jobsData.jobs.map(j => j.location.split('|')[0].trim()))
    return ['All', ...Array.from(locs)]
  }, [jobsData])

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    if (!jobsData?.jobs) return []
    return jobsData.jobs.filter((job) => {
      // Tab filter
      if (activeTab !== 'All') {
        if (activeTab === 'Virtual' && (job.work_mode !== 'Virtual' && job.work_mode !== 'Hybrid')) return false
        if (activeTab !== 'Virtual' && job.work_mode !== activeTab) return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = job.title.toLowerCase().includes(q)
        const matchCompany = job.company.toLowerCase().includes(q)
        const matchLoc = job.location.toLowerCase().includes(q)
        const matchSkill = job.match_reason.toLowerCase().includes(q)
        if (!matchTitle && !matchCompany && !matchLoc && !matchSkill) return false
      }

      // Location dropdown filter
      if (selectedLocation !== 'All' && !job.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false
      }

      // Salary filter
      if (selectedSalary !== 'All') {
        if (selectedSalary === '8+ LPA' && !job.salary.includes('8') && !job.salary.includes('10') && !job.salary.includes('12') && !job.salary.includes('15')) return false
        if (selectedSalary === '5+ LPA' && !job.salary.includes('5') && !job.salary.includes('6') && !job.salary.includes('7') && !job.salary.includes('8') && !job.salary.includes('10')) return false
      }

      return true
    })
  }, [jobsData, activeTab, searchQuery, selectedLocation, selectedSalary])

  if (loading && !jobsData) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
        <p className="animate-pulse font-display text-base font-semibold text-ink">AI is curating placement drives & matching jobs for your profile...</p>
      </div>
    )
  }

  if (error && !jobsData) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 px-4 text-center">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2 border border-red-100">
          <Briefcase size={24} />
        </div>
        <h3 className="font-display text-xl font-bold text-ink">Unable to Load AI Jobs</h3>
        <p className="text-sm text-muted max-w-md">{error}</p>
        <button
          onClick={() => fetchJobs(true)}
          className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-display font-bold text-white hover:bg-primary/90 transition-all shadow-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  const reasons = jobsData?.recommended_reasons || {
    skills: "Strong match with your core technical skills and projects.",
    resume: "ATS resume structure aligns with hiring standards.",
    interests: "Matches your target career path and preferred work mode."
  }

  return (
    <div className="space-y-xl pb-12">
      {/* ─── Top Header & Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas via-canvas to-primary/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-3">
              <Sparkles size={14} /> AI Matched Opportunities
            </div>
            <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Job Recommendations & Placement Drives</h1>
            <p className="mt-1 text-sm text-body max-w-2xl">
              Real-time career opportunities curated by Vertex AI from top tech companies and startups based on your skills, experience, and ATS resume readiness.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchJobs(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-canvas px-4 py-2.5 text-sm font-semibold text-ink shadow-sm hover:border-primary/40 hover:bg-surface-soft transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-primary' : 'text-muted'} />
              <span>{refreshing ? 'Refreshing Matches...' : 'Refresh AI Matches'}</span>
            </button>

            <a
              href="https://internship.aicte-india.org/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-surface-strong px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-soft transition-all"
            >
              <Calendar size={16} />
              <span>View Calendar</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Filter Tabs & Search Bar ─────────────────────────────────────── */}
      <section className="space-y-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-canvas p-4 rounded-2xl border border-hairline shadow-sm">
          {/* Work Mode Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {['All', 'On Campus', 'Off Campus', 'Remote', 'Virtual'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-display font-bold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-soft text-body hover:bg-surface-strong hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input & Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, skills or companies..."
                className="w-full rounded-xl border border-hairline bg-surface-soft/50 pl-10 pr-4 py-2 text-xs text-ink placeholder-muted focus:border-primary focus:bg-canvas focus:outline-none transition-all"
              />
            </div>

            {/* Location Dropdown */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="rounded-xl border border-hairline bg-surface-soft/50 px-3 py-2 text-xs font-semibold text-ink focus:border-primary focus:bg-canvas focus:outline-none cursor-pointer"
            >
              <option value="All">📍 All Locations</option>
              {availableLocations.filter(l => l !== 'All').map(loc => (
                <option key={loc} value={loc}>📍 {loc}</option>
              ))}
            </select>

            {/* Salary Dropdown */}
            <select
              value={selectedSalary}
              onChange={(e) => setSelectedSalary(e.target.value)}
              className="rounded-xl border border-hairline bg-surface-soft/50 px-3 py-2 text-xs font-semibold text-ink focus:border-primary focus:bg-canvas focus:outline-none cursor-pointer"
            >
              <option value="All">💰 All Salaries</option>
              <option value="5+ LPA">💰 ₹5+ LPA</option>
              <option value="8+ LPA">💰 ₹8+ LPA</option>
            </select>
          </div>
        </div>

        {/* Results count banner */}
        <div className="flex items-center justify-between px-2 text-xs font-medium text-muted">
          <span>Showing <strong className="text-ink">{filteredJobs.length}</strong> AI matched jobs for your profile</span>
          {activeTab !== 'All' && <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">Filtered by {activeTab}</span>}
        </div>
      </section>

      {/* ─── Jobs Grid ────────────────────────────────────────────────────── */}
      {filteredJobs.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-base">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-hairline bg-canvas p-16 text-center">
          <Briefcase size={40} className="text-muted mb-3 opacity-50" />
          <h3 className="font-display text-lg font-bold text-ink">No jobs found matching your filters</h3>
          <p className="mt-1 text-xs text-muted max-w-sm">Try clearing your search query or switching to 'All' work modes to see more placement drives.</p>
          <button
            onClick={() => { setActiveTab('All'); setSearchQuery(''); setSelectedLocation('All'); setSelectedSalary('All'); }}
            className="mt-4 rounded-xl bg-primary/10 px-4 py-2 text-xs font-display font-bold text-primary hover:bg-primary/20 transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ─── Bottom AI Explanation Banner (From Reference Image 2) ────────── */}
      <section className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 shrink-0 font-display text-sm font-bold text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">✓</span>
            <span>Recommended because:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-soft/60 border border-hairline/60">
              <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-xs font-bold text-ink">Your Skills</h4>
                <p className="text-[11px] text-body mt-0.5 leading-normal">{reasons.skills}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-soft/60 border border-hairline/60">
              <FileText size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-xs font-bold text-ink">Resume Readiness</h4>
                <p className="text-[11px] text-body mt-0.5 leading-normal">{reasons.resume}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-soft/60 border border-hairline/60">
              <Target size={18} className="text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-xs font-bold text-ink">Career Interests</h4>
                <p className="text-[11px] text-body mt-0.5 leading-normal">{reasons.interests}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default JobRecommendations
