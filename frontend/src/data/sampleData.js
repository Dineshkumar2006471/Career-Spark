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
    title: 'Foundation: role fundamentals',
    timeline: 'Weeks 1-4',
    skills: ['HTML/CSS', 'JavaScript basics', 'Git/GitHub', 'Responsive layouts'],
    outcome: 'Ship a polished personal portfolio and two small UI projects that prove beginner frontend readiness.',
    focus_areas: ['Map entry-level frontend job descriptions', 'Practice layout and JavaScript fundamentals daily', 'Publish every project with clear README notes'],
    courses: [
      { title: 'Responsive Web Design', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
      { title: 'HTML, CSS, and JavaScript for Web Developers', provider: 'Coursera', url: 'https://www.coursera.org/learn/html-css-javascript-for-web-developers' },
    ],
    certifications: [
      { title: 'Responsive Web Design Certification', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
    ],
    internships: [
      { title: 'AICTE beginner internship search', provider: 'AICTE Internship Portal', url: 'https://internship.aicte-india.org/' },
    ],
    weekly_actions: [
      'Week 1: audit target roles and list missing frontend skills.',
      'Week 2: complete layout exercises and publish a personal homepage.',
      'Week 3: build a JavaScript mini project with form or API behavior.',
      'Week 4: convert both projects into resume-ready bullets.',
    ],
    proof_outputs: ['Portfolio homepage', 'Two GitHub repositories', 'Resume project bullets'],
  },
  {
    title: 'Build proof: React and product workflows',
    timeline: 'Weeks 5-8',
    skills: ['React components', 'APIs', 'State management', 'Accessibility'],
    outcome: 'Build a dashboard project that consumes real API data and demonstrates maintainable frontend thinking.',
    focus_areas: ['Convert static UI into reusable React components', 'Use real API states: loading, empty, and error', 'Explain accessibility and state-management decisions'],
    courses: [
      { title: 'Front End Development Libraries', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/' },
      { title: 'Forage technology simulations', provider: 'Forage', url: 'https://www.theforage.com/simulations?query=frontend' },
    ],
    certifications: [
      { title: 'Front End Development Libraries Certification', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/' },
    ],
    internships: [
      { title: 'Forage virtual job simulations', provider: 'Forage', url: 'https://www.theforage.com/simulations?query=frontend' },
      { title: 'SWAYAM Plus internships', provider: 'SWAYAM Plus', url: 'https://swayam-plus.swayam2.ac.in/internship' },
    ],
    weekly_actions: [
      'Week 5: scope a dashboard with data, filters, and responsive layout.',
      'Week 6: implement API integration with loading and error states.',
      'Week 7: complete one job simulation or guided frontend project.',
      'Week 8: polish README, screenshots, deployment link, and portfolio story.',
    ],
    proof_outputs: ['React dashboard deployment', 'Simulation completion proof', 'Portfolio case study'],
  },
  {
    title: 'Apply: shortlist-ready execution',
    timeline: 'Weeks 9-12',
    skills: ['Testing', 'Performance', 'Resume stories', 'Interview practice'],
    outcome: 'Apply to internships with a project-backed resume, interview stories, and a tracked follow-up rhythm.',
    focus_areas: ['Target beginner-friendly frontend roles', 'Customize resume bullets for each application', 'Practice explaining project tradeoffs aloud'],
    courses: [
      { title: 'Mock interview practice', provider: 'CareerSpark', url: '/dashboard/interview' },
    ],
    certifications: [
      { title: 'Finish the highest-signal certificate from earlier phases', provider: 'Selected provider', url: 'https://www.coursera.org/search?query=frontend%20certificate' },
    ],
    internships: [
      { title: 'Live frontend internships', provider: 'CareerSpark / Adzuna', url: '/dashboard/internships' },
      { title: 'Official AICTE internships', provider: 'AICTE Internship Portal', url: 'https://internship.aicte-india.org/' },
    ],
    weekly_actions: [
      'Week 9: shortlist 15 internships and map each requirement to proof.',
      'Week 10: apply to 5 roles and track application status.',
      'Week 11: run mock interviews and refine weak answers.',
      'Week 12: follow up, improve resume from feedback, and repeat applications.',
    ],
    proof_outputs: ['Targeted resume', 'Application tracker', 'Mock interview feedback', 'Follow-up message templates'],
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
