/*
 * Courses renders direct external learning, simulation, and internship links
 * mapped to the student's target role and skill gaps.
 */
import { BookOpen, ExternalLink, Search, Zap } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { loadProfile, loadRoadmap, loadSkillProgress, loadResumeVersions } from '../../services/supabaseData.js'
import { fetchDashboardAnalysis } from '../../services/apiClient.js'
import { buildDashboardPayload, getTargetRole, buildSkillGaps, buildLearningResources, buildSimulationResources } from '../../services/careerAnalysis.js'

const COURSE_BRAND_LOGOS = {
  'google cloud skills boost': 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=128',
  'google career certificates': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'google skills': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'google cloud': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'aws skill builder': 'https://www.google.com/s2/favicons?domain=explore.skillbuilder.aws&sz=128',
  'amazon web services': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  'aws': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  'microsoft learn': 'https://www.google.com/s2/favicons?domain=learn.microsoft.com&sz=128',
  'microsoft': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  'linkedin learning': 'https://www.google.com/s2/favicons?domain=www.linkedin.com&sz=128',
  'linkedin': 'https://www.google.com/s2/favicons?domain=www.linkedin.com&sz=128',
  'cisco networking academy': 'https://www.google.com/s2/favicons?domain=www.cisco.com&sz=128',
  'cisco': 'https://www.google.com/s2/favicons?domain=www.cisco.com&sz=128',
  'oracle university': 'https://www.google.com/s2/favicons?domain=www.oracle.com&sz=128',
  'oracle': 'https://www.google.com/s2/favicons?domain=www.oracle.com&sz=128',
  'meta': 'https://www.google.com/s2/favicons?domain=www.meta.com&sz=128',
  'coursera': 'https://www.google.com/s2/favicons?domain=www.coursera.org&sz=128',
  'freecodecamp': 'https://www.google.com/s2/favicons?domain=www.freecodecamp.org&sz=128',
  'udemy': 'https://www.google.com/s2/favicons?domain=www.udemy.com&sz=128',
  'edx': 'https://www.google.com/s2/favicons?domain=www.edx.org&sz=128',
  'pluralsight': 'https://www.google.com/s2/favicons?domain=www.pluralsight.com&sz=128',
  'udacity': 'https://www.google.com/s2/favicons?domain=www.udacity.com&sz=128',
  'deeplearning.ai': 'https://www.google.com/s2/favicons?domain=www.deeplearning.ai&sz=128',
  'kaggle': 'https://www.google.com/s2/favicons?domain=www.kaggle.com&sz=128',
  'the forage': 'https://www.google.com/s2/favicons?domain=www.theforage.com&sz=128',
  'theforage': 'https://www.google.com/s2/favicons?domain=www.theforage.com&sz=128',
  'forage': 'https://www.google.com/s2/favicons?domain=www.theforage.com&sz=128',
  'swayam plus': 'https://www.google.com/s2/favicons?domain=swayam.gov.in&sz=128',
  'swayam': 'https://www.google.com/s2/favicons?domain=swayam.gov.in&sz=128',
  'nptel': 'https://www.google.com/s2/favicons?domain=www.nptel.ac.in&sz=128',
  'geeksforgeeks': 'https://www.google.com/s2/favicons?domain=www.geeksforgeeks.org&sz=128',
  'codecademy': 'https://www.google.com/s2/favicons?domain=www.codecademy.com&sz=128',
  'datacamp': 'https://www.google.com/s2/favicons?domain=www.datacamp.com&sz=128',
  'ibm': 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
  'simplilearn': 'https://www.google.com/s2/favicons?domain=www.simplilearn.com&sz=128',
  'upgrad': 'https://www.google.com/s2/favicons?domain=www.upgrad.com&sz=128',
  'scaler': 'https://www.google.com/s2/favicons?domain=www.scaler.com&sz=128',
  'newton school': 'https://www.google.com/s2/favicons?domain=www.newtonschool.co&sz=128',
  'harvardx': 'https://www.google.com/s2/favicons?domain=www.edx.org&sz=128',
  'mitx': 'https://www.google.com/s2/favicons?domain=www.edx.org&sz=128',
  'aicte internship portal': 'https://www.google.com/s2/favicons?domain=aicte-india.org&sz=128',
  'aicte': 'https://www.google.com/s2/favicons?domain=aicte-india.org&sz=128',
  'national internship portal': 'https://www.google.com/s2/favicons?domain=aicte-india.org&sz=128',
  'scrimba': 'https://www.google.com/s2/favicons?domain=scrimba.com&sz=128',
  'brilliant': 'https://www.google.com/s2/favicons?domain=brilliant.org&sz=128',
  'khan academy': 'https://www.google.com/s2/favicons?domain=www.khanacademy.org&sz=128'
}

const COURSE_DOMAIN_MAP = {
  'google cloud skills boost': 'cloud.google.com',
  'google career certificates': 'www.google.com',
  'google skills': 'www.google.com',
  'google cloud': 'cloud.google.com',
  'google': 'www.google.com',
  'aws skill builder': 'explore.skillbuilder.aws',
  'amazon web services': 'aws.amazon.com',
  'aws': 'aws.amazon.com',
  'microsoft learn': 'learn.microsoft.com',
  'microsoft': 'www.microsoft.com',
  'linkedin learning': 'www.linkedin.com',
  'linkedin': 'www.linkedin.com',
  'cisco networking academy': 'www.cisco.com',
  'cisco': 'www.cisco.com',
  'oracle university': 'www.oracle.com',
  'oracle': 'www.oracle.com',
  'meta': 'www.meta.com',
  'coursera': 'www.coursera.org',
  'freecodecamp': 'www.freecodecamp.org',
  'udemy': 'www.udemy.com',
  'edx': 'www.edx.org',
  'pluralsight': 'www.pluralsight.com',
  'udacity': 'www.udacity.com',
  'deeplearning.ai': 'www.deeplearning.ai',
  'kaggle': 'www.kaggle.com',
  'the forage': 'www.theforage.com',
  'theforage': 'www.theforage.com',
  'forage': 'www.theforage.com',
  'swayam plus': 'swayam.gov.in',
  'swayam': 'swayam.gov.in',
  'nptel': 'www.nptel.ac.in',
  'geeksforgeeks': 'www.geeksforgeeks.org',
  'codecademy': 'www.codecademy.com',
  'datacamp': 'www.datacamp.com',
  'ibm': 'www.ibm.com',
  'simplilearn': 'www.simplilearn.com',
  'upgrad': 'www.upgrad.com',
  'scaler': 'www.scaler.com',
  'newton school': 'www.newtonschool.co',
  'harvardx': 'www.edx.org',
  'mitx': 'www.edx.org',
  'aicte internship portal': 'aicte-india.org',
  'aicte': 'aicte-india.org',
  'national internship portal': 'aicte-india.org',
  'scrimba': 'scrimba.com',
  'brilliant': 'brilliant.org',
  'khan academy': 'www.khanacademy.org'
}

function CourseLogo({ provider, title, url, className = "h-11 w-11 p-1.5" }) {
  const compKey = useMemo(() => {
    const text = `${provider || ''} ${title || ''} ${url || ''}`.toLowerCase()
    const sortedKeys = Object.keys(COURSE_BRAND_LOGOS).sort((a, b) => b.length - a.length)
    for (const key of sortedKeys) {
      if (text.includes(key)) return key
    }
    return (provider || '').toLowerCase().trim()
  }, [provider, title, url])

  const directLogo = COURSE_BRAND_LOGOS[compKey]
  const resolvedDomain = COURSE_DOMAIN_MAP[compKey] || (compKey ? `${compKey.replace(/[^a-z0-9]/g, '')}.com` : null)

  const [stage, setStage] = useState(directLogo ? 0 : (resolvedDomain ? 1 : 3))

  useEffect(() => {
    setStage(directLogo ? 0 : (resolvedDomain ? 1 : 3))
  }, [directLogo, resolvedDomain])

  const getLogoUrl = () => {
    if (stage === 0 && directLogo) return directLogo
    if (stage === 1 && resolvedDomain) {
      const dom = resolvedDomain.startsWith('www.') || (resolvedDomain.includes('.') && !resolvedDomain.startsWith('http')) ? resolvedDomain : `www.${resolvedDomain}`
      return `https://www.google.com/s2/favicons?domain=${dom}&sz=128`
    }
    if (stage === 2 && resolvedDomain) return `https://icons.duckduckgo.com/ip3/${resolvedDomain}.ico`
    return null
  }

  const logoUrl = getLogoUrl()

  if (!logoUrl || stage >= 3) {
    const initials = provider ? provider.slice(0, 2).toUpperCase() : 'CO'
    const bgColors = ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700']
    const colorClass = bgColors[(provider || '').length % bgColors.length]
    return (
      <div className={`grid place-items-center rounded-xl font-display text-sm font-bold shadow-xs border border-hairline shrink-0 ${className} ${colorClass}`} title={provider}>
        {initials}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center bg-white rounded-xl shadow-2xs border border-hairline shrink-0 ${className}`}>
      <img
        src={logoUrl}
        alt={`${provider || 'Course provider'} logo`}
        className="max-h-full max-w-full object-contain filter drop-shadow-2xs transition-transform duration-300 group-hover:scale-110"
        onError={() => {
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

// Renders course recommendations and returns a filter-ready list.
function Courses() {
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [skills, setSkills] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    Promise.all([
      loadProfile(),
      loadRoadmap(),
      loadSkillProgress(),
      loadResumeVersions()
    ]).then(async ([prof, rdmp, skillsList, resumes]) => {
      if (prof) setProfile(prof)
      if (rdmp) setRoadmap(rdmp)
      if (skillsList?.length) setSkills(skillsList)
      
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

  if (isAnalyzing) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500"></div>
        <p className="animate-pulse font-display text-sm font-semibold text-muted">Finding the best courses for you...</p>
      </div>
    )
  }

  if (!analysis || analysis.error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <p className="font-display text-lg font-semibold text-red-500">Failed to load courses.</p>
        <p className="text-sm text-muted">{analysis?.error || 'Please check your profile data or try again later.'}</p>
      </div>
    )
  }

  const courses = analysis.courses || []

  return (
    <div className="space-y-xl">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas to-blue-500/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-sm rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">
            <Search size={14} /> Resource Hub
          </div>
          <h2 className="font-display text-3xl font-bold">Recommended Courses for {analysis.targetRole}</h2>
          <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body">Curated learning resources matched to your target role and skill gaps. Links go directly to real courses on trusted platforms.</p>
        </div>
      </section>

      {/* Courses List */}
      {courses.length > 0 && (
        <section className="space-y-base">
          <div className="flex items-center gap-sm mb-lg">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen size={20} /></div>
            <h2 className="font-display text-xl font-bold">Recommended Courses</h2>
          </div>
          <div className="grid gap-base md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <a className="group rounded-2xl border border-hairline bg-canvas p-lg hover:border-primary/30 hover:shadow-md transition-all flex flex-col h-full" href={course.url} key={`course-${index}`} rel="noreferrer" target="_blank">
                <div className="flex justify-between items-start mb-base">
                  <div className="flex items-center gap-3">
                    <CourseLogo provider={course.provider} title={course.title} url={course.url} className="h-11 w-11 p-1.5" />
                    <div>
                      <span className="inline-flex rounded-lg bg-surface-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink border border-hairline shadow-2xs">{course.provider}</span>
                    </div>
                  </div>
                  <span className="inline-flex rounded-lg bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-200 shrink-0">{course.price}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-ink mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm leading-relaxed text-body flex-1">{course.reason}</p>
                
                <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Zap size={12} /> {course.skill || "Core Skill"}
                  </span>
                  <ExternalLink size={16} className="text-muted group-hover:text-primary transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Courses
