/*
 * sampleData contains demo-safe defaults used before live APIs return data.
 * It keeps pages explainable for a mentor demo even when credentials are not configured.
 */

export const careerPaths = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    match: 87,
    salary: '3.5-8 LPA',
    outlook: 'High demand for product teams and SaaS startups',
    summary: 'Build user interfaces with React, accessibility, performance, and design systems.',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    match: 78,
    salary: '3-7 LPA',
    outlook: 'Strong entry-level demand across operations and finance teams',
    summary: 'Turn raw data into decisions using spreadsheets, SQL, dashboards, and Python.',
  },
  {
    id: 'cloud-support',
    title: 'Cloud Support Associate',
    match: 71,
    salary: '3-6.5 LPA',
    outlook: 'Growing demand as Indian businesses modernize infrastructure',
    summary: 'Help teams run reliable cloud systems through Linux, networking, and AWS basics.',
  },
]

export const roadmapPhases = [
  {
    title: 'Month 1: Foundation and Role Fundamentals',
    timeline: 'Weeks 1-4',
    outcome: 'Ship a polished personal portfolio and two small UI projects that prove beginner frontend readiness.',
    detailed_skills: [
      {
        skill_name: 'Core role concepts',
        summary: 'Understand the fundamental terminology, HTML/CSS layout structures, and tools for Frontend Development.',
        courses: [
          { title: 'Responsive Web Design', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' }
        ],
        certifications: [
          { title: 'Responsive Web Design Certification', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' }
        ]
      },
      {
        skill_name: 'Git & Version Control',
        summary: 'Learn to manage code and collaborate with others using Git and GitHub.',
        courses: [
          { title: 'Git for Beginners', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/' }
        ],
        certifications: []
      }
    ],
    step_by_step_plan: [
      { timeframe: 'Week 1', action: 'Audit target roles and list missing frontend skills.' },
      { timeframe: 'Week 2', action: 'Complete layout exercises and publish a personal homepage.' },
      { timeframe: 'Week 3', action: 'Build a JavaScript mini project with form or API behavior.' },
      { timeframe: 'Week 4', action: 'Convert both projects into resume-ready bullets.' }
    ],
    proof_outputs: ['Portfolio homepage', 'Two GitHub repositories', 'Resume project bullets']
  },
  {
    title: 'Month 2: Build proof with React',
    timeline: 'Weeks 5-8',
    outcome: 'Build a dashboard project that consumes real API data and demonstrates maintainable frontend thinking.',
    detailed_skills: [
      {
        skill_name: 'React and APIs',
        summary: 'Convert static UI into reusable React components and use real API states.',
        courses: [
          { title: 'Front End Development Libraries', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/' }
        ],
        certifications: [
          { title: 'Front End Development Libraries Certification', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/' }
        ]
      },
      {
        skill_name: 'Accessibility and Simulation',
        summary: 'Explain accessibility and state-management decisions through job simulations.',
        courses: [
          { title: 'Forage technology simulations', provider: 'Forage', url: 'https://www.theforage.com/simulations?query=frontend' }
        ],
        certifications: []
      }
    ],
    step_by_step_plan: [
      { timeframe: 'Week 5', action: 'Scope a dashboard with data, filters, and responsive layout.' },
      { timeframe: 'Week 6', action: 'Implement API integration with loading and error states.' },
      { timeframe: 'Week 7', action: 'Complete one job simulation or guided frontend project.' },
      { timeframe: 'Week 8', action: 'Polish README, screenshots, deployment link, and portfolio story.' }
    ],
    proof_outputs: ['React dashboard deployment', 'Simulation completion proof', 'Portfolio case study']
  },
  {
    title: 'Month 3: Apply and Shortlist',
    timeline: 'Weeks 9-12',
    outcome: 'Apply to internships with a project-backed resume, interview stories, and a tracked follow-up rhythm.',
    detailed_skills: [
      {
        skill_name: 'Resume Stories and Interviews',
        summary: 'Target beginner-friendly frontend roles and practice explaining project tradeoffs aloud.',
        courses: [
          { title: 'Mock interview practice', provider: 'CareerSpark', url: '/dashboard/interview' }
        ],
        certifications: []
      }
    ],
    step_by_step_plan: [
      { timeframe: 'Week 9', action: 'Shortlist 15 internships and map each requirement to proof.' },
      { timeframe: 'Week 10', action: 'Apply to 5 roles and track application status.' },
      { timeframe: 'Week 11', action: 'Run mock interviews and refine weak answers.' },
      { timeframe: 'Week 12', action: 'Follow up, improve resume from feedback, and repeat applications.' }
    ],
    proof_outputs: ['Targeted resume', 'Application tracker', 'Mock interview feedback', 'Follow-up message templates']
  },
]

export const skills = [
  ['HTML/CSS', 90, 95],
  ['JavaScript', 62, 90],
  ['React', 48, 85],
  ['Git', 70, 80],
  ['APIs', 42, 75],
]

export const certifications = [
  ['freeCodeCamp Responsive Web Design', 'freeCodeCamp', 'completed'],
  ['Meta Front-End Developer Foundations', 'Coursera', 'recommended'],
  ['JavaScript Algorithms and Data Structures', 'freeCodeCamp', 'in-progress'],
]

export const courses = [
  ['HTML, CSS, and JavaScript for Web Developers', 'Coursera', 'Free audit', 'Frontend foundations'],
  ['CS50 Web Programming', 'Harvard / edX', 'Free audit', 'React and backend basics'],
  ['Responsive Web Design', 'freeCodeCamp', 'Free', 'Portfolio-ready projects'],
]

export const internshipFallback = [
  {
    source: 'Demo',
    title: 'Frontend Intern',
    company: 'Product Studio',
    location: 'Remote / India',
    url: '#',
    description: 'Build React components and improve dashboard accessibility.',
  },
  {
    source: 'Demo',
    title: 'Web Development Intern',
    company: 'Campus SaaS Lab',
    location: 'Bengaluru',
    url: '#',
    description: 'Work on landing pages, forms, and API integration tasks.',
  },
]
