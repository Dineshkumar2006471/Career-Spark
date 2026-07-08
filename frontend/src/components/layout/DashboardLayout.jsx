/*
 * DashboardLayout creates the persistent dashboard frame from DESIGN.md Section 8.
 * It exists so all dashboard screens share navigation, topbar, and floating chat.
 */
import {
  Award,
  Bot,
  BriefcaseBusiness,
  FileText,
  Home,
  Map,
  Mic,
  Search,
  User,
  Wrench,
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import AIChatWidget from '../chatbot/AIChatWidget.jsx'
import UserNavMenu from './UserNavMenu.jsx'

const navItems = [
  ['Home', '/dashboard', Home],
  ['Roadmap', '/dashboard/roadmap', Map],
  ['Skills', '/dashboard/skills', Wrench],
  ['Certs', '/dashboard/certifications', Award],
  ['Courses', '/dashboard/courses', Search],
  ['Internships', '/dashboard/internships', BriefcaseBusiness],
  ['Resume', '/dashboard/resume', FileText],
  ['Interview', '/dashboard/interview', Mic],
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
    <div className="h-screen overflow-hidden bg-surface-soft text-ink lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="hidden h-screen overflow-y-auto border-r border-hairline bg-canvas lg:block">
        <div className="px-lg py-xl">
          <p className="font-display text-xl font-semibold">CareerSpark</p>
          <p className="mt-xs text-sm text-body">Roadmap workspace</p>
        </div>
        <nav className="space-y-xs px-sm">
          {navItems.map(([label, to, Icon]) => (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-sm rounded-sm px-base py-sm text-sm font-medium ${
                  isActive ? 'border-l-[3px] border-ink bg-surface-soft text-ink' : 'text-body hover:bg-surface-soft hover:text-ink'
                }`
              }
              end={to === '/dashboard'}
              key={to}
              to={to}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col pb-24 lg:pb-0">
        <header className="z-10 shrink-0 border-b border-hairline bg-canvas">
          <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-lg px-lg py-base">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">CareerSpark</p>
              <h1 className="font-display text-2xl font-semibold leading-tight">{getTitle(pathname)}</h1>
            </div>
            <div className="flex items-center gap-sm">
              <div className="hidden h-11 min-w-[300px] items-center gap-sm rounded-md border border-hairline bg-canvas px-base text-sm text-muted xl:flex">
                <Search aria-hidden="true" size={18} />
                Search roadmap, skills, internships
              </div>
              <UserNavMenu />
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1120px] px-lg py-xl">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-hairline bg-canvas lg:hidden">
        {navItems.slice(0, 4).map(([label, to, Icon]) => (
          <NavLink className="grid place-items-center gap-xxs py-xs text-[11px] text-body" end={to === '/dashboard'} key={to} to={to}>
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
