/*
 * UserNavMenu renders the authenticated profile trigger used by public-adjacent
 * pages and the dashboard shell.
 */
import { LogOut, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../context/authState.js'
import { supabase } from '../../services/supabaseClient.js'
import { loadProfile } from '../../services/supabaseData.js'
import { clearOnboardingComplete } from '../../services/onboardingState.js'

function getInitials(profile, user) {
  const first = profile?.first_name?.trim()?.[0]
  const last = profile?.last_name?.trim()?.[0]
  const email = user?.email?.trim()?.[0]
  return `${first || email || 'U'}${last || ''}`.toUpperCase()
}

// Renders a profile avatar dropdown and returns profile/logout actions.
function UserNavMenu({ className = '' }) {
  const auth = useAuth()
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!auth?.user) return
    loadProfile().then(setProfile).catch(() => setProfile(null))
  }, [auth?.user])

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const displayName = useMemo(() => {
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
    return name || auth?.user?.email || 'Student'
  }, [auth?.user?.email, profile?.first_name, profile?.last_name])

  async function handleLogout() {
    if (auth?.user?.id) clearOnboardingComplete(auth.user.id)
    if (supabase) await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!auth?.user) return null

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        aria-expanded={open}
        aria-label="Open profile menu"
        className="flex h-11 items-center gap-sm rounded-md border border-hairline bg-canvas px-sm text-sm font-medium text-ink hover:bg-surface-soft"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="grid h-8 w-8 place-items-center rounded-md bg-ink font-mono text-xs text-white">
          {getInitials(profile, auth.user)}
        </span>
        <span className="hidden max-w-36 truncate text-left md:block">
          {displayName}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-72 rounded-lg border border-hairline bg-canvas p-sm shadow-float">
          <div className="border-b border-hairline px-sm pb-sm">
            <p className="font-display text-base font-semibold text-ink">{displayName}</p>
            <p className="mt-xxs truncate text-xs text-body">{auth.user.email}</p>
            <p className="mt-xs text-xs font-medium uppercase tracking-[0.04em] text-muted">CareerSpark student workspace</p>
          </div>
          <div className="pt-sm">
            <Link
              className="flex items-center gap-sm rounded-sm px-sm py-sm text-sm font-medium text-body hover:bg-surface-soft hover:text-ink"
              onClick={() => setOpen(false)}
              to="/dashboard/profile"
            >
              <User aria-hidden="true" size={17} />
              Profile
            </Link>
            <button
              className="flex w-full items-center gap-sm rounded-sm px-sm py-sm text-left text-sm font-medium text-body hover:bg-surface-soft hover:text-ink"
              onClick={handleLogout}
              type="button"
            >
              <LogOut aria-hidden="true" size={17} />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default UserNavMenu
