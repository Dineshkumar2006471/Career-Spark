/*
 * App defines the public routing shell for CareerSpark.
 * It exists so each page can remain isolated while React Router owns navigation.
 */
import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout.jsx'))
const ProfileWizard = lazy(() => import('./pages/onboarding/ProfileWizard.jsx'))
const Assessment = lazy(() => import('./pages/onboarding/Assessment.jsx'))
const Results = lazy(() => import('./pages/onboarding/Results.jsx'))
const ChoosePath = lazy(() => import('./pages/onboarding/ChoosePath.jsx'))
const Home = lazy(() => import('./pages/dashboard/Home.jsx'))
const Roadmap = lazy(() => import('./pages/dashboard/Roadmap.jsx'))
const Skills = lazy(() => import('./pages/dashboard/Skills.jsx'))
const Certifications = lazy(() => import('./pages/dashboard/Certifications.jsx'))
const Courses = lazy(() => import('./pages/dashboard/Courses.jsx'))
const Internships = lazy(() => import('./pages/dashboard/Internships.jsx'))
const Resume = lazy(() => import('./pages/dashboard/Resume.jsx'))
const Interview = lazy(() => import('./pages/dashboard/Interview.jsx'))
const Profile = lazy(() => import('./pages/dashboard/Profile.jsx'))

// Renders the route tree and returns the active page component.
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<main className="grid min-h-screen place-items-center bg-canvas text-ink">Loading CareerSpark...</main>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding/profile" element={<ProtectedRoute><ProfileWizard /></ProtectedRoute>} />
              <Route path="/onboarding/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
              <Route path="/onboarding/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
              <Route path="/onboarding/choose" element={<ProtectedRoute><ChoosePath /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Home />} />
                <Route path="roadmap" element={<Roadmap />} />
                <Route path="skills" element={<Skills />} />
                <Route path="certifications" element={<Certifications />} />
                <Route path="courses" element={<Courses />} />
                <Route path="internships" element={<Internships />} />
                <Route path="resume" element={<Resume />} />
                <Route path="interview" element={<Interview />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
