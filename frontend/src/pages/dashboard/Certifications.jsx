/*
 * Certifications renders a kanban board for tracking professional credentials.
 * It exists to give students a structured way to manage the proof artifacts hiring managers look for.
 */
import { Award, CheckCircle2, Circle, Clock, ExternalLink, Plus, Trash2, X, Search, Sparkles, BookOpen, Briefcase } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { loadCertifications, saveCertifications, loadProfile, loadRoadmap } from '../../services/supabaseData.js'
import { getTargetRole } from '../../services/careerAnalysis.js'
import Button from '../../components/ui/Button.jsx'

const CERT_BRAND_LOGOS = {
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
  'ibm': 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
  'microsoft azure': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  'azure': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  'aws cloud': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  'databricks': 'https://www.google.com/s2/favicons?domain=www.databricks.com&sz=128',
  'salesforce': 'https://www.google.com/s2/favicons?domain=www.salesforce.com&sz=128',
  'snowflake': 'https://www.google.com/s2/favicons?domain=www.snowflake.com&sz=128',
  'cncf': 'https://www.google.com/s2/favicons?domain=www.cncf.io&sz=128',
  'kubernetes': 'https://www.google.com/s2/favicons?domain=kubernetes.io&sz=128',
  'hashicorp': 'https://www.google.com/s2/favicons?domain=www.hashicorp.com&sz=128',
  'comptia': 'https://www.google.com/s2/favicons?domain=www.comptia.org&sz=128',
  'red hat': 'https://www.google.com/s2/favicons?domain=www.redhat.com&sz=128',
  'mongodb': 'https://www.google.com/s2/favicons?domain=www.mongodb.com&sz=128',
  'docker': 'https://www.google.com/s2/favicons?domain=www.docker.com&sz=128',
  'github': 'https://www.google.com/s2/favicons?domain=www.github.com&sz=128',
  'linux foundation': 'https://www.google.com/s2/favicons?domain=www.linuxfoundation.org&sz=128',
  'upgrad': 'https://www.google.com/s2/favicons?domain=www.upgrad.com&sz=128',
  'scaler': 'https://www.google.com/s2/favicons?domain=www.scaler.com&sz=128',
  'newton school': 'https://www.google.com/s2/favicons?domain=www.newtonschool.co&sz=128',
  'harvardx': 'https://www.google.com/s2/favicons?domain=www.edx.org&sz=128',
  'mitx': 'https://www.google.com/s2/favicons?domain=www.edx.org&sz=128',
  'scrimba': 'https://www.google.com/s2/favicons?domain=scrimba.com&sz=128'
}

const CERT_DOMAIN_MAP = {
  'google cloud skills boost': 'cloud.google.com',
  'google career certificates': 'www.google.com',
  'google skills': 'www.google.com',
  'google cloud': 'cloud.google.com',
  'google': 'www.google.com',
  'aws skill builder': 'explore.skillbuilder.aws',
  'amazon web services': 'aws.amazon.com',
  'aws cloud': 'aws.amazon.com',
  'aws': 'aws.amazon.com',
  'microsoft learn': 'learn.microsoft.com',
  'microsoft azure': 'azure.microsoft.com',
  'azure': 'azure.microsoft.com',
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
  'ibm': 'www.ibm.com',
  'simplilearn': 'www.simplilearn.com',
  'databricks': 'www.databricks.com',
  'salesforce': 'www.salesforce.com',
  'snowflake': 'www.snowflake.com',
  'cncf': 'www.cncf.io',
  'kubernetes': 'kubernetes.io',
  'hashicorp': 'www.hashicorp.com',
  'comptia': 'www.comptia.org',
  'red hat': 'www.redhat.com',
  'mongodb': 'www.mongodb.com',
  'docker': 'www.docker.com',
  'github': 'www.github.com',
  'linux foundation': 'www.linuxfoundation.org',
  'upgrad': 'www.upgrad.com',
  'scaler': 'www.scaler.com',
  'newton school': 'www.newtonschool.co',
  'harvardx': 'www.edx.org',
  'mitx': 'www.edx.org',
  'scrimba': 'scrimba.com'
}

function CertLogo({ provider, title, url, className = "h-9 w-9 p-1" }) {
  const compKey = useMemo(() => {
    const text = `${provider || ''} ${title || ''} ${url || ''}`.toLowerCase()
    const sortedKeys = Object.keys(CERT_BRAND_LOGOS).sort((a, b) => b.length - a.length)
    for (const key of sortedKeys) {
      if (text.includes(key)) return key
    }
    return (provider || '').toLowerCase().trim()
  }, [provider, title, url])

  const directLogo = CERT_BRAND_LOGOS[compKey]
  const resolvedDomain = CERT_DOMAIN_MAP[compKey] || (compKey ? `${compKey.replace(/[^a-z0-9]/g, '')}.com` : null)

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
    const initials = provider ? provider.slice(0, 2).toUpperCase() : 'CE'
    const bgColors = ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700']
    const colorClass = bgColors[(provider || '').length % bgColors.length]
    return (
      <div className={`grid place-items-center rounded-xl font-display text-xs font-bold shadow-xs border border-hairline shrink-0 ${className} ${colorClass}`} title={provider}>
        {initials}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center bg-white rounded-xl shadow-2xs border border-hairline shrink-0 ${className}`}>
      <img
        src={logoUrl}
        alt={`${provider || 'Certification provider'} logo`}
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

const ALL_OFFICIAL_CERTS = [
  // Cloud & DevOps
  {
    title: 'AWS Certified Solutions Architect – Associate (SAA-C03)',
    provider: 'AWS Cloud',
    category: 'Cloud & DevOps',
    url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    reason: 'Gold standard for cloud architecture; screened heavily by technical recruiters and ATS algorithms.'
  },
  {
    title: 'Microsoft Certified: Azure Administrator Associate (AZ-104)',
    provider: 'Microsoft Azure',
    category: 'Cloud & DevOps',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/',
    reason: 'Core operational certification for enterprise Azure cloud infrastructure and identity governance.'
  },
  {
    title: 'Google Cloud Certified Associate Cloud Engineer',
    provider: 'Google Cloud',
    category: 'Cloud & DevOps',
    url: 'https://cloud.google.com/learn/certification/cloud-engineer',
    reason: 'Demonstrates foundational skills in deploying and managing GCP infrastructure and Kubernetes clusters.'
  },
  {
    title: 'Certified Kubernetes Administrator (CKA)',
    provider: 'Kubernetes',
    category: 'Cloud & DevOps',
    url: 'https://www.cncf.io/certification/cka/',
    reason: '100% hands-on performance exam; top benchmark for container orchestration in enterprise production.'
  },
  {
    title: 'HashiCorp Certified: Terraform Associate (003)',
    provider: 'HashiCorp',
    category: 'Cloud & DevOps',
    url: 'https://www.hashicorp.com/certification/terraform-associate',
    reason: 'Essential industry credential for Infrastructure as Code (IaC) across multi-cloud environments.'
  },
  {
    title: 'Docker Certified Associate (DCA)',
    provider: 'Docker',
    category: 'Cloud & DevOps',
    url: 'https://www.docker.com/certification',
    reason: 'Proves mastery of container runtime, networking, security, and Docker Compose orchestration.'
  },
  {
    title: 'Red Hat Certified System Administrator (RHCSA)',
    provider: 'Red Hat',
    category: 'Cloud & DevOps',
    url: 'https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhcsa-exam',
    reason: 'Performance-based Linux system administration gold standard required for DevOps engineers.'
  },
  // Data Science & AI
  {
    title: 'Databricks Certified Data Engineer Associate',
    provider: 'Databricks',
    category: 'Data Science & AI',
    url: 'https://www.databricks.com/learn/certification/data-engineer-associate',
    reason: 'Highly sought-after credential for modern lakehouse & Apache Spark ETL pipeline engineering.'
  },
  {
    title: 'Snowflake SnowPro Core Certification',
    provider: 'Snowflake',
    category: 'Data Science & AI',
    url: 'https://www.snowflake.com/en/support/education/certifications/snowpro-core/',
    reason: 'Validates architectural and SQL optimization expertise on the Snowflake cloud data warehouse.'
  },
  {
    title: 'Google Data Analytics Professional Certificate',
    provider: 'Google Career Certificates',
    category: 'Data Science & AI',
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    reason: 'Proven entry-to-intermediate industry proof for data wrangling, R programming, SQL, and Tableau.'
  },
  {
    title: 'Microsoft Certified: Azure Data Engineer Associate (DP-203)',
    provider: 'Microsoft Azure',
    category: 'Data Science & AI',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/',
    reason: 'Benchmark certification for building enterprise analytics pipelines and data lakes on Azure.'
  },
  {
    title: 'AWS Certified Data Engineer – Associate',
    provider: 'AWS Cloud',
    category: 'Data Science & AI',
    url: 'https://aws.amazon.com/certification/certified-data-engineer-associate/',
    reason: 'Validates core data ingestion, transformation, and governance on AWS Glue and Redshift.'
  },
  {
    title: 'DeepLearning.AI TensorFlow Developer Professional Certificate',
    provider: 'DeepLearning.AI',
    category: 'Data Science & AI',
    url: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice',
    reason: 'Hands-on validation of neural network construction and deep learning models for NLP and vision.'
  },
  {
    title: 'Databricks Certified Machine Learning Associate',
    provider: 'Databricks',
    category: 'Data Science & AI',
    url: 'https://www.databricks.com/learn/certification/machine-learning-associate',
    reason: 'Proves practical ability to train, evaluate, and deploy ML models using MLflow on Databricks.'
  },
  // Full Stack & Web Dev
  {
    title: 'Meta Front-End Developer Professional Certificate',
    provider: 'Meta',
    category: 'Full Stack & Web',
    url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    reason: 'Official Meta training covering React, UI/UX design, Jest testing, and front-end architecture.'
  },
  {
    title: 'Meta Back-End Developer Professional Certificate',
    provider: 'Meta',
    category: 'Full Stack & Web',
    url: 'https://www.coursera.org/professional-certificates/meta-back-End-developer',
    reason: 'Rigorous backend curriculum in Python, Django, REST APIs, MySQL, and database engineering.'
  },
  {
    title: 'AWS Certified Developer – Associate (DVA-C02)',
    provider: 'AWS Cloud',
    category: 'Full Stack & Web',
    url: 'https://aws.amazon.com/certification/certified-developer-associate/',
    reason: 'Validates proficiency in developing, deploying, and debugging serverless cloud-native apps.'
  },
  {
    title: 'MongoDB Certified Developer Associate',
    provider: 'MongoDB',
    category: 'Full Stack & Web',
    url: 'https://www.mongodb.com/services/training/certification',
    reason: 'Proves mastery of NoSQL schema design, indexing, aggregation pipelines, and CRUD operations.'
  },
  {
    title: 'GitHub Foundations Certification',
    provider: 'GitHub',
    category: 'Full Stack & Web',
    url: 'https://resources.github.com/learn/certifications/',
    reason: 'Official verification of Git workflows, collaboration, CI/CD actions, and repository governance.'
  },
  {
    title: 'Microsoft Certified: Azure Developer Associate (AZ-204)',
    provider: 'Microsoft Azure',
    category: 'Full Stack & Web',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/',
    reason: 'Essential certification for building end-to-end cloud applications and APIs on Microsoft Azure.'
  },
  // Salesforce & Enterprise CRM
  {
    title: 'Salesforce Certified Administrator',
    provider: 'Salesforce',
    category: 'Salesforce & Enterprise',
    url: 'https://trailhead.salesforce.com/en/credentials/administrator',
    reason: 'The foundational must-have credential for any enterprise CRM role or Salesforce consulting.'
  },
  {
    title: 'Salesforce Certified Platform Developer I',
    provider: 'Salesforce',
    category: 'Salesforce & Enterprise',
    url: 'https://trailhead.salesforce.com/en/credentials/platformdeveloperi',
    reason: 'Validates Apex programming and Lightning Web Component (LWC) development skills.'
  },
  {
    title: 'Microsoft Certified: Power BI Data Analyst Associate (PL-300)',
    provider: 'Microsoft Azure',
    category: 'Salesforce & Enterprise',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/',
    reason: 'Industry gold standard for enterprise dashboarding, DAX modeling, and business intelligence.'
  },
  {
    title: 'Oracle Cloud Infrastructure (OCI) Foundations Associate',
    provider: 'Oracle',
    category: 'Salesforce & Enterprise',
    url: 'https://education.oracle.com/oracle-cloud-infrastructure-2023-foundations-associate/pexam_1Z0-1085-23',
    reason: 'Validates core cloud architecture and database infrastructure management on Oracle Cloud.'
  },
  {
    title: 'Salesforce Certified AI Associate',
    provider: 'Salesforce',
    category: 'Salesforce & Enterprise',
    url: 'https://trailhead.salesforce.com/en/credentials/aiassociate',
    reason: 'Validates foundational knowledge of enterprise AI, ethics, data clouds, and CRM automation.'
  },
  // Cybersecurity & Systems
  {
    title: 'CompTIA Security+ (SY0-701)',
    provider: 'CompTIA',
    category: 'Cybersecurity & Systems',
    url: 'https://www.comptia.org/certifications/security',
    reason: 'Globally recognized DoD 8570 baseline certification for cybersecurity resilience and SOC roles.'
  },
  {
    title: 'Google Cybersecurity Professional Certificate',
    provider: 'Google Career Certificates',
    category: 'Cybersecurity & Systems',
    url: 'https://www.coursera.org/professional-certificates/google-cybersecurity',
    reason: 'Hands-on SOC analyst training in SIEM tools, SQL, Python, Linux, and network vulnerability defense.'
  },
  {
    title: 'AWS Certified Security – Specialty',
    provider: 'AWS Cloud',
    category: 'Cybersecurity & Systems',
    url: 'https://aws.amazon.com/certification/certified-security-specialty/',
    reason: 'Advanced credential proving mastery in cloud encryption, access control, and threat detection.'
  },
  {
    title: 'CompTIA Linux+ (XK0-005)',
    provider: 'CompTIA',
    category: 'Cybersecurity & Systems',
    url: 'https://www.comptia.org/certifications/linux',
    reason: 'Validates critical Linux kernel administration, shell scripting, and server security skills.'
  },
  {
    title: 'Cisco Certified Network Associate (CCNA)',
    provider: 'Cisco Networking Academy',
    category: 'Cybersecurity & Systems',
    url: 'https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html',
    reason: 'The definitive industry networking credential covering IP connectivity, security, and automation.'
  }
]

function Certifications() {
  const [items, setItems] = useState([])
  const [targetRole, setTargetRole] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCert, setNewCert] = useState({ title: '', provider: '', url: '', status: 'planned' })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadCertifications().then(setItems).catch(() => {})
    Promise.all([loadProfile(), loadRoadmap()]).then(([prof, rdmp]) => {
      const role = getTargetRole(prof, rdmp)
      if (role && role !== 'Target Role Not Set' && role !== 'Entry Level Internship') {
        setTargetRole(role)
      } else {
        const storedPath = JSON.parse(localStorage.getItem('careerspark_path') || '{}')
        setTargetRole(storedPath.title || 'Full Stack Developer')
      }
    }).catch(() => {
      const storedPath = JSON.parse(localStorage.getItem('careerspark_path') || '{}')
      setTargetRole(storedPath.title || 'Full Stack Developer')
    })
  }, [])

  const handleSaveItems = async (newItems) => {
    setItems(newItems)
    try {
      await saveCertifications(newItems)
    } catch (err) {
      console.error('Failed to save certifications', err)
    }
  }

  const handleAddCert = async (e) => {
    e.preventDefault()
    if (!newCert.title || !newCert.provider) return
    setIsSaving(true)
    const newItem = {
      id: Date.now().toString(),
      title: newCert.title,
      provider: newCert.provider,
      url: newCert.url || '#',
      status: newCert.status,
      earned_date: newCert.status === 'completed' ? new Date().toISOString() : null
    }
    const updatedItems = [...items, newItem]
    await handleSaveItems(updatedItems)
    setIsModalOpen(false)
    setNewCert({ title: '', provider: '', url: '', status: 'planned' })
    setIsSaving(false)
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    const updatedItems = items.filter(item => item.id !== id && item.id !== undefined)
    await handleSaveItems(updatedItems)
  }

  // --- Drag and Drop Logic ---
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('cert_id', item.id)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, columnId) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('cert_id')
    const itemIndex = items.findIndex(item => item.id == itemId)
    if (itemIndex > -1 && items[itemIndex].status !== columnId) {
      const updatedItems = [...items]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        status: columnId,
        earned_date: columnId === 'completed' ? new Date().toISOString() : null
      }
      await handleSaveItems(updatedItems)
    }
  }

  const columns = [
    { id: 'planned', title: 'Planned', icon: Circle, color: 'text-slate-400' },
    { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-blue-500' },
    { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  ]

  const filteredCerts = useMemo(() => {
    return ALL_OFFICIAL_CERTS.filter(cert => {
      if (activeTab !== 'All' && cert.category !== activeTab) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = cert.title.toLowerCase().includes(q)
        const matchProvider = cert.provider.toLowerCase().includes(q)
        const matchCat = cert.category.toLowerCase().includes(q)
        const matchReason = cert.reason.toLowerCase().includes(q)
        if (!matchTitle && !matchProvider && !matchCat && !matchReason) return false
      }
      return true
    })
  }, [activeTab, searchQuery])

  return (
    <div className="space-y-xl pb-12 relative">
      {/* ─── Top Hero & Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas via-canvas to-purple-500/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-sm rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 mb-3">
              <Sparkles size={14} /> Official Proctored Credentials
            </div>
            <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Industry Certifications & Credentials</h1>
            <p className="mt-1 text-sm text-body max-w-2xl">
              Brutally honest, industry-vetted proctored exams and official credentials from major tech leaders (AWS, Google, Microsoft, Databricks, Meta, Salesforce) that genuinely carry weight with technical recruiters and ATS algorithms.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-primary shadow-md hover:shadow-lg transition-all shrink-0"
          >
            <Plus size={16} /> Add Custom Credential
          </button>
        </div>
      </section>

      {/* ─── Filter Tabs & Search Bar ─────────────────────────────────────── */}
      <section className="space-y-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-canvas p-4 rounded-2xl border border-hairline shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {['All', 'Cloud & DevOps', 'Data Science & AI', 'Full Stack & Web', 'Salesforce & Enterprise', 'Cybersecurity & Systems'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-display font-bold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-surface-soft text-body hover:bg-surface-strong hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input Bar */}
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search certifications, skills or providers..."
              className="w-full rounded-xl border border-hairline bg-surface-soft/50 pl-10 pr-4 py-2 text-xs text-ink placeholder-muted focus:border-purple-600 focus:bg-canvas focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Results count banner */}
        <div className="flex items-center justify-between px-2 text-xs font-medium text-muted">
          <span>Showing <strong className="text-ink">{filteredCerts.length}</strong> official recommended certifications for your profile</span>
          {activeTab !== 'All' && <span className="bg-purple-500/10 text-purple-600 px-2.5 py-0.5 rounded-full font-bold">Filtered by {activeTab}</span>}
        </div>
      </section>

      {/* ─── Official Recommended Certifications Grid ─────────────────────── */}
      {filteredCerts.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-base">
          {filteredCerts.map((item, i) => {
            const isAlreadyTracked = items.some(track => track.title.toLowerCase() === item.title.toLowerCase())
            return (
              <div className="group flex flex-col justify-between rounded-2xl border border-hairline bg-canvas p-5 hover:border-purple-400 hover:shadow-md transition-all h-full shadow-sm relative" key={i}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <CertLogo provider={item.provider} title={item.title} url={item.url} className="h-11 w-11 p-1.5 shrink-0" />
                      <div>
                        <span className="inline-flex rounded-md bg-surface-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink border border-hairline shadow-2xs block mb-0.5">{item.provider}</span>
                        <span className="text-[10px] text-muted font-semibold">{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-display font-bold text-base text-ink leading-snug mb-2.5 group-hover:text-purple-600 transition-colors">{item.title}</h4>
                  <p className="text-xs text-body leading-relaxed mb-5">{item.reason}</p>
                </div>
                
                <div className="pt-4 border-t border-hairline flex items-center justify-between gap-2 mt-auto">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-purple-600 transition-colors"
                  >
                    Official Exam <ExternalLink size={13} />
                  </a>
                  
                  <button
                    type="button"
                    disabled={isAlreadyTracked}
                    onClick={() => {
                      if (!isAlreadyTracked) {
                        const newItem = {
                          id: Date.now().toString() + '-' + i,
                          title: item.title,
                          provider: item.provider,
                          url: item.url,
                          status: 'planned',
                          earned_date: null
                        }
                        handleSaveItems([...items, newItem])
                      }
                    }}
                    className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-2xs ${
                      isAlreadyTracked 
                        ? 'bg-green-100 text-green-700 cursor-default border border-green-200' 
                        : 'bg-ink text-white hover:bg-purple-600 hover:text-white border border-transparent shadow-sm'
                    }`}
                  >
                    {isAlreadyTracked ? (
                      <>In Pipeline <CheckCircle2 size={13} /></>
                    ) : (
                      <>+ Track in Pipeline <Plus size={13} /></>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-hairline bg-canvas p-16 text-center">
          <Award size={40} className="text-muted mb-3 opacity-50" />
          <h3 className="font-display text-lg font-bold text-ink">No certifications found matching your filters</h3>
          <p className="mt-1 text-xs text-muted max-w-sm">Try clearing your search query or switching to 'All' categories to see more official credentials.</p>
          <button
            onClick={() => { setActiveTab('All'); setSearchQuery(''); }}
            className="mt-4 rounded-xl bg-purple-500/10 px-4 py-2 text-xs font-display font-bold text-purple-600 hover:bg-purple-500/20 transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ─── My Tracked Certifications Pipeline (Kanban Board) ────────────── */}
      <section className="rounded-3xl border border-hairline bg-canvas p-xl shadow-sm mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-lg border-b border-hairline pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1 text-xs font-bold text-ink mb-1.5 border border-hairline">
              <Briefcase size={14} className="text-purple-600" /> Tracked Progress
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">My Tracked Certifications Pipeline</h2>
            <p className="text-sm text-body mt-0.5">Drag & drop cards across columns as you study and pass your proctored exams.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted bg-surface-soft px-3 py-1.5 rounded-xl border border-hairline">
            <span>Total Tracked: <strong className="text-ink">{items.length}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {columns.map((col) => {
            const colItems = items.filter((item) => item.status === col.id)
            return (
              <div 
                className="rounded-2xl bg-surface-soft/50 p-4 flex flex-col border border-hairline/60 hover:border-purple-500/20 transition-colors min-h-[220px]" 
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-display font-bold text-ink flex items-center gap-2 text-xs uppercase tracking-wider">
                    <col.icon size={16} className={col.color} />
                    {col.title}
                  </h3>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-muted border border-hairline shadow-2xs">{colItems.length}</span>
                </div>
                
                <div className="flex-1 space-y-3 p-1 rounded-xl">
                  {colItems.length === 0 ? (
                    <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-hairline/60 bg-canvas/40">
                      <p className="text-xs text-muted font-medium italic">No credentials in '{col.title}'</p>
                      <p className="text-[10px] text-muted/70 mt-1 max-w-[180px]">Click "+ Track in Pipeline" on any card above to add here.</p>
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <article 
                        className="group cursor-grab active:cursor-grabbing rounded-xl border border-hairline bg-canvas p-4 shadow-sm hover:border-purple-300 hover:shadow-md transition-all relative" 
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                      >
                        <div className="mb-3 flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <CertLogo provider={item.provider} title={item.title} url={item.url} className="h-9 w-9 p-1 shrink-0" />
                            <span className="inline-flex rounded-lg bg-surface-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted border border-hairline">{item.provider}</span>
                          </div>
                          <button onClick={(e) => handleDelete(item.id, e)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h4 className="font-display font-bold text-sm text-ink leading-snug">{item.title}</h4>
                        
                        <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
                          {item.earned_date ? (
                            <span className="text-[11px] text-green-600 font-semibold">Earned: {new Date(item.earned_date).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-[11px] text-muted font-medium">Target: Q3 2026</span>
                          )}
                          {item.url && item.url !== '#' && (
                            <a className="text-muted hover:text-purple-600 transition-colors" href={item.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Add Custom Credential Modal ──────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="bg-canvas rounded-2xl border border-hairline shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-lg border-b border-hairline">
              <h3 className="font-display text-xl font-bold text-ink">Add Custom Credential</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-ink transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCert} className="p-lg space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Certification Title</label>
                <input required type="text" value={newCert.title} onChange={e => setNewCert({...newCert, title: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-hairline bg-surface-soft text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. AWS Solutions Architect" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Provider / Vendor</label>
                <input required type="text" value={newCert.provider} onChange={e => setNewCert({...newCert, provider: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-hairline bg-surface-soft text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. Amazon Web Services" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Status</label>
                <select value={newCert.status} onChange={e => setNewCert({...newCert, status: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-hairline bg-surface-soft text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Official Exam URL (Optional)</label>
                <input type="url" value={newCert.url} onChange={e => setNewCert({...newCert, url: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-hairline bg-surface-soft text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="https://..." />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Add Credential'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default Certifications
