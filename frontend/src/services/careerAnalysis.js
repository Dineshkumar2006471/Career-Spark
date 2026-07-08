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

export function getTargetSkills(targetRole, profileSkills = []) {
  const role = targetRole.toLowerCase()
  if (role.includes('data')) return roleSkillMap.data
  if (role.includes('cloud')) return roleSkillMap.cloud
  if (role.includes('backend')) return roleSkillMap.backend
  if (role.includes('design') || role.includes('ui') || role.includes('ux')) return roleSkillMap.design
  if (role.includes('frontend') || role.includes('front-end') || role.includes('react')) return roleSkillMap.frontend
  return [...new Set([...roleSkillMap.frontend.slice(0, 5), ...asArray(profileSkills).slice(0, 4)])]
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
        title: `${gap.skill} role course search`,
        provider: 'SWAYAM',
        type: 'Official courses',
        price: 'Free/low cost',
        reason: gap.reason,
        url: `https://swayam.gov.in/explorer?searchText=${query}`,
        skill: gap.skill,
      },
      {
        title: `${gap.skill} guided projects`,
        provider: 'freeCodeCamp',
        type: 'Practice',
        price: 'Free',
        reason: `Build proof for ${gap.skill}`,
        url: `https://www.freecodecamp.org/search?query=${query}`,
        skill: gap.skill,
      },
      {
        title: `${targetRole} professional course`,
        provider: 'Coursera',
        type: 'Course catalog',
        price: 'Free audit/paid certificate',
        reason: `Structured learning for ${targetRole}`,
        url: `https://www.coursera.org/search?query=${query}`,
        skill: gap.skill,
      },
    ]
  })
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
