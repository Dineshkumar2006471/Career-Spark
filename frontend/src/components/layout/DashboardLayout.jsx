/*
 * DashboardLayout creates the persistent dashboard frame.
 * It exists so all dashboard screens share navigation, topbar, and floating chat.
 */
import {
  Award,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  Home,
  Map,
  Mic,
  Search,
  User,
  Wrench,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import AIChatWidget from '../chatbot/AIChatWidget.jsx'
import UserNavMenu from './UserNavMenu.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import logo from '../../assets/logo.png'

const navItems = [
  ['Home', '/dashboard', Home],
  ['Roadmap', '/dashboard/roadmap', Map],
  ['Skill Analysis', '/dashboard/skills', Wrench],
  ['Certifications', '/dashboard/certifications', Award],
  ['Courses', '/dashboard/courses', Search],
  ['Internships', '/dashboard/internships', BriefcaseBusiness],
  ['Resume Analyzer', '/dashboard/resume', FileText],
  ['Mock Interview', '/dashboard/interview', Mic],
  ['Profile', '/dashboard/profile', User],
]

// Resolves the current dashboard title and returns a display string.
function getTitle(pathname) {
  const match = navItems.find(([, path]) => path === pathname)
  return match ? match[0] : 'Dashboard'
}

// Renders the dashboard shell and returns shared navigation plus the active child route.
function DashboardLayout() {
  const { pathname } = useLocation()

  return (
    <div className="h-screen overflow-hidden bg-surface-soft text-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden h-screen overflow-y-auto border-r border-hairline bg-canvas lg:flex lg:flex-col">
        <div className="px-lg py-xl">
          <Link className="inline-block" to="/">
            <img src={logo} alt="CareerSpark Logo" className="h-14 w-auto" />
          </Link>
        </div>
        <nav className="flex-1 space-y-xs px-base">
          {navItems.map(([label, to, Icon]) => (
            <NavLink
              className={({ isActive }) =>
                `group flex items-center gap-sm rounded-xl px-base py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-body hover:bg-surface-soft hover:text-ink'
                }`
              }
              end={to === '/dashboard'}
              key={to}
              to={to}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={2} className="shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight aria-hidden="true" size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>
        <div className="px-lg py-lg border-t border-hairline">
          <p className="text-xs text-muted text-center">Powered by Gemini AI</p>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col pb-24 lg:pb-0">
        <header className="z-10 shrink-0 border-b border-hairline bg-canvas">
          <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between gap-lg px-lg">
            <h1 className="font-display text-2xl font-semibold text-ink">{getTitle(pathname)}</h1>
            <div className="flex items-center gap-6">
              <div className="hidden h-10 w-96 cursor-pointer items-center gap-3 rounded-full bg-surface-soft px-4 text-sm text-muted transition-colors hover:bg-surface-dark/5 lg:flex">
                <Search aria-hidden="true" size={18} />
                <span className="flex-1 text-left">Search roadmap, skills, internships...</span>
              </div>
              <ThemeToggle />
              <UserNavMenu />
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1180px] px-lg py-xl">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-hairline bg-canvas/90 backdrop-blur-md lg:hidden">
        {navItems.slice(0, 4).map(([label, to, Icon]) => (
          <NavLink className={({ isActive }) => `grid place-items-center gap-xxs py-xs text-[11px] ${isActive ? 'text-primary' : 'text-body'}`} end={to === '/dashboard'} key={to} to={to}>
            <Icon aria-hidden="true" size={18} />
            {label}
          </NavLink>
        ))}
        <NavLink className="grid place-items-center gap-xxs py-xs text-[11px] text-body" to="/dashboard/profile">
          <Bot aria-hidden="true" size={18} />
          More
        </NavLink>
      </nav>

      <AIChatWidget />
    </div>
  )
}

export default DashboardLayout
