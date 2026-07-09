/*
 * careerAnalysis converts saved profile, roadmap, resume, and skill rows into
 * hiring-style dashboard signals and external learning/application resources.
 */

const roleSkillMap = {
  frontend: ['HTML/CSS', 'JavaScript', 'React', 'Git', 'APIs', 'Accessibility', 'Testing', 'Portfolio'],
  data: ['Excel', 'SQL', 'Python', 'Statistics', 'Power BI', 'Dashboards', 'Storytelling'],
  cloud: ['Linux', 'Networking', 'AWS', 'Troubleshooting', 'Security basics', 'Documentation'],
  backend: ['Python', 'APIs', 'Databases', 'Authentication', 'Testing', 'Deployment'],
  design: ['Figma', 'UX research', 'Wireframes', 'Prototyping', 'Design systems'],
  ai: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow/PyTorch', 'Math & Statistics', 'NLP', 'Data Preprocessing', 'Model Deployment'],
  ml: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow/PyTorch', 'Math & Statistics', 'NLP', 'Data Preprocessing', 'Model Deployment'],
  devops: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS/GCP', 'Terraform', 'Monitoring', 'Scripting'],
  mobile: ['React Native', 'Flutter', 'Swift/Kotlin', 'Mobile UI', 'App Store Deployment', 'APIs', 'Testing'],
  fullstack: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Databases', 'APIs', 'Git', 'Deployment'],
  cybersecurity: ['Networking', 'Linux', 'Cryptography', 'Penetration Testing', 'SIEM', 'Security Frameworks', 'Incident Response'],
  product: ['User Research', 'Roadmapping', 'Agile/Scrum', 'Data Analytics', 'Wireframing', 'Stakeholder Management', 'A/B Testing'],
  marketing: ['SEO', 'Content Strategy', 'Analytics', 'Social Media', 'Email Marketing', 'Copywriting', 'Campaign Management'],
  blockchain: ['Solidity', 'Smart Contracts', 'Web3.js', 'Cryptography', 'DeFi', 'Ethereum', 'Security Auditing'],
  game: ['Unity/Unreal', 'C#/C++', 'Game Physics', '3D Modeling', 'Shaders', 'Game Design', 'Version Control'],
  embedded: ['C/C++', 'Microcontrollers', 'RTOS', 'PCB Design', 'Communication Protocols', 'Debugging', 'Sensors'],
}

function clean(value) {
  return String(value || '').trim()
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function slug(value) {
  return encodeURIComponent(clean(value).replaceAll('/', ' '))
}

export function getTargetRole(profile, roadmap, fallbackPath) {
  const goalNote = clean(profile?.goal_note)
  const targetMatch = goalNote.match(/Target role:\s*([^|]+)/i)
  const explicit = clean(profile?.target_role || targetMatch?.[1] || goalNote)
  const roadmapRole = clean(roadmap?.career_path)
  const fallback = clean(fallbackPath?.title)
  if (explicit && explicit.length <= 48) return explicit
  if (roadmapRole) return roadmapRole
  if (fallback) return fallback
  if (profile?.current_course) return `${profile.current_course} Internship`
  return 'Entry Level Internship'
}

export function buildDashboardPayload(profile, roadmap, resumes) {
  const fallbackPath = JSON.parse(localStorage.getItem('careerspark_path') || 'null') || { title: 'Frontend Development' }
  const targetRole = getTargetRole(profile, roadmap, fallbackPath)
  return {
    target_role: targetRole,
    profile_skills: profile?.skills || [],
    projects: profile?.projects || [],
    experience: profile?.experience_items || [],
    resume_score: resumes?.[0]?.ats_score || null,
    goal_note: profile?.goal_note || ""
  }
}

export function getTargetSkills(targetRole, profileSkills = []) {
  const role = targetRole.toLowerCase()
  if (role.includes('ai') || role.includes('artificial intelligence')) return roleSkillMap.ai
  if (role.includes('machine learning') || role.includes('ml engineer')) return roleSkillMap.ml
  if (role.includes('data')) return roleSkillMap.data
  if (role.includes('cloud')) return roleSkillMap.cloud
  if (role.includes('devops') || role.includes('sre') || role.includes('infrastructure')) return roleSkillMap.devops
  if (role.includes('mobile') || role.includes('android') || role.includes('ios') || role.includes('flutter')) return roleSkillMap.mobile
  if (role.includes('fullstack') || role.includes('full stack') || role.includes('full-stack')) return roleSkillMap.fullstack
  if (role.includes('backend') || role.includes('back-end') || role.includes('back end')) return roleSkillMap.backend
  if (role.includes('design') || role.includes('ui') || role.includes('ux')) return roleSkillMap.design
  if (role.includes('frontend') || role.includes('front-end') || role.includes('react')) return roleSkillMap.frontend
  if (role.includes('cyber') || role.includes('security') || role.includes('infosec')) return roleSkillMap.cybersecurity
  if (role.includes('product manager') || role.includes('product management')) return roleSkillMap.product
  if (role.includes('marketing') || role.includes('growth')) return roleSkillMap.marketing
  if (role.includes('blockchain') || role.includes('web3') || role.includes('crypto')) return roleSkillMap.blockchain
  if (role.includes('game') || role.includes('unity') || role.includes('unreal')) return roleSkillMap.game
  if (role.includes('embedded') || role.includes('iot') || role.includes('firmware')) return roleSkillMap.embedded
  
  // If it's a custom role, use their profile skills and some general tech skills
  const baseSkills = asArray(profileSkills)
  if (baseSkills.length > 0) return [...new Set(baseSkills)]
  
  // Ultimate fallback
  return ['Communication', 'Problem Solving', 'Project Management', 'Client Relations']
}

export function buildSkillGaps(profile, skillRows, targetRole) {
  const savedSkills = asArray(profile?.skills)
  const targetSkills = getTargetSkills(targetRole, savedSkills)
  const rowMap = new Map(asArray(skillRows).map((row) => [row.skill_name, row]))
  return targetSkills.map((skill) => {
    const row = rowMap.get(skill)
    const current = row?.current_level ?? (savedSkills.some((item) => item.toLowerCase() === skill.toLowerCase()) ? 55 : 20)
    const target = row?.target_level ?? 85
    const gap = Math.max(0, target - current)
    return {
      skill,
      current,
      target,
      gap,
      priority: gap >= 35 ? 'Critical' : gap >= 18 ? 'Important' : 'Polish',
      reason: gap >= 35 ? 'Missing or weak hiring signal' : gap >= 18 ? 'Needs stronger proof before applying' : 'Close to target level',
    }
  }).sort((a, b) => b.gap - a.gap)
}

export function buildHiringAnalysis({ profile, roadmap, resumeRows, skillRows, fallbackPath }) {
  const targetRole = getTargetRole(profile, roadmap, fallbackPath)
  const gaps = buildSkillGaps(profile, skillRows, targetRole)
  const resumeScore = resumeRows?.[0]?.ats_score ?? profile?.resume_feedback?.score ?? null
  const projects = asArray(profile?.projects)
  const applications = asArray(profile?.applications)
  const achievements = asArray(profile?.achievements)
  const experience = asArray(profile?.experience_items)
  const strongestSignals = [
    resumeScore ? `Resume score ${resumeScore}/100` : '',
    projects.length ? `${projects.length} project proof item${projects.length > 1 ? 's' : ''}` : '',
    achievements.length ? `${achievements.length} achievement${achievements.length > 1 ? 's' : ''}` : '',
    experience.length ? `${experience.length} experience item${experience.length > 1 ? 's' : ''}` : '',
  ].filter(Boolean)
  const riskSignals = [
    gaps[0]?.gap > 25 ? `${gaps[0].skill} is the largest skill gap` : '',
    !projects.length ? 'No project proof added' : '',
    !applications.length ? 'No applications tracked yet' : '',
    !profile?.current_course ? 'Current course missing from profile' : '',
  ].filter(Boolean)
  const readinessScore = Math.max(
    1,
    Math.min(
      99,
      Math.round(
        (resumeScore || 55) * 0.35 +
        Math.min(25, projects.length * 8) +
        Math.min(15, achievements.length * 5) +
        Math.min(15, Math.max(0, 100 - (gaps[0]?.gap || 30)) * 0.15) +
        Math.min(10, applications.length * 2),
      ),
    ),
  )

  return {
    targetRole,
    readinessScore,
    resumeScore,
    gaps,
    strongestSignals,
    riskSignals,
    nextActions: [
      gaps[0] ? `Close ${gaps[0].skill} first; it blocks ${targetRole} shortlisting.` : 'Add target skills to unlock gap analysis.',
      projects.length ? `Convert "${projects[0]}" into a recruiter-readable portfolio story.` : 'Add one project that proves the target role skill.',
      resumeScore ? 'Use the resume page to improve weak bullets before applying.' : 'Upload a resume so CareerSpark can score ATS readiness.',
      applications.length ? 'Track outcomes for existing applications and follow up.' : `Apply to 3 beginner-friendly ${targetRole} opportunities this week.`,
    ],
  }
}

export function buildLearningResources(targetRole, gaps) {
  const topGaps = gaps.slice(0, 5)
  return topGaps.flatMap((gap) => {
    const query = slug(`${gap.skill} ${targetRole}`)
    return [
      {
        title: `Google Career Certificates: ${gap.skill}`,
        provider: 'Google',
        type: 'Official Certification',
        price: 'Free audit / Coursera',
        reason: gap.reason,
        url: `https://grow.google/certificates/`,
        skill: gap.skill,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg'
      },
      {
        title: `Microsoft Learn: ${gap.skill} Path`,
        provider: 'Microsoft Learn',
        type: 'Official Path',
        price: 'Free',
        reason: `Build proof for ${gap.skill}`,
        url: `https://learn.microsoft.com/en-us/search/?terms=${slug(gap.skill)}`,
        skill: gap.skill,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg'
      },
      {
        title: `AWS Skill Builder: ${gap.skill}`,
        provider: 'AWS',
        type: 'Official Training',
        price: 'Free tiers available',
        reason: `Industry standard training for ${gap.skill}`,
        url: `https://explore.skillbuilder.aws/learn/catalog?q=${slug(gap.skill)}`,
        skill: gap.skill,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg'
      },
      {
        title: `Udemy Masterclass: ${gap.skill}`,
        provider: 'Udemy',
        type: 'Premium Course',
        price: 'Paid',
        reason: `Deep dive into ${gap.skill}`,
        url: `https://www.udemy.com/courses/search/?src=ukw&q=${slug(gap.skill)}`,
        skill: gap.skill,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg'
      }
    ]
  }).slice(0, 9)
}

export function buildSimulationResources(targetRole) {
  const query = slug(targetRole)
  return [
    {
      title: `${targetRole} job simulations`,
      provider: 'Forage',
      type: 'Virtual job simulation',
      price: 'Free',
      reason: 'Self-paced job tasks you can discuss in interviews',
      url: `https://www.theforage.com/simulations?query=${query}`,
    },
    {
      title: `${targetRole} early-career opportunities`,
      provider: 'Forage',
      type: 'Early career roles',
      price: 'External platform',
      reason: 'Internships, events, and early-career jobs',
      url: `https://www.theforage.com/jobs?query=${query}`,
    },
    {
      title: `${targetRole} India internships`,
      provider: 'AICTE Internship Portal',
      type: 'Verified internships',
      price: 'Free for students',
      reason: 'Official Indian internship portal',
      url: 'https://internship.aicte-india.org/',
    },
    {
      title: `${targetRole} SWAYAM Plus internships`,
      provider: 'SWAYAM Plus',
      type: 'Internship catalog',
      price: 'External platform',
      reason: 'Course-linked internship discovery',
      url: 'https://swayam-plus.swayam2.ac.in/internship',
    },
  ]
}
