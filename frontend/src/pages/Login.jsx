/*
 * Login renders the split-screen Supabase-ready sign-in page from DESIGN.md Section 5.
 * It exists to authenticate returning students without visual competition on the form side.
 */
import { CircleUserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import authPhoto from '../assets/student-roadmap-login.jpg'
import Button from '../components/ui/Button.jsx'
import { supabase } from '../services/supabaseClient.js'
import { useState } from 'react'
import PublicNav from '../components/layout/PublicNav.jsx'
import { useAuth } from '../context/authState.js'
import { loadProfile } from '../services/supabaseData.js'

// Renders the login form and returns a Supabase email/password or Google OAuth flow.
function Login() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Signs in with email/password and returns the next route.
  async function handleEmailLogin(event) {
    event.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured yet. Fill frontend/.env, then restart Vite.')
      return
    }
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    const profile = await loadProfile().catch(() => null)
    navigate(profile?.onboarding_completed ? '/dashboard' : '/onboarding/profile', { replace: true })
  }

  // Starts Supabase Google OAuth and returns control to Supabase redirect handling.
  async function handleGoogleLogin() {
    if (!supabase) {
      setError('Supabase is not configured yet. Fill frontend/.env, then restart Vite.')
      return
    }
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/onboarding/profile` } })
  }

  return (
    <main className="min-h-screen bg-page-warm text-ink">
      <PublicNav />
      <section className="mx-auto grid min-h-[calc(100vh-120px)] max-w-[1120px] overflow-hidden rounded-lg border border-hairline bg-canvas md:grid-cols-[1.05fr_0.95fr]">
        <div className="flex items-center justify-center px-lg py-xl">
          <div className="w-full max-w-md">
            <Link className="font-display text-2xl font-semibold" to="/">
              CareerSpark
            </Link>
            <p className="mt-xl inline-flex rounded-sm border border-hairline px-sm py-xs text-xs font-medium uppercase tracking-[0.04em] text-body">Welcome back</p>
            <h1 className="mt-lg font-display text-5xl font-semibold leading-[1.05]">Continue your roadmap.</h1>
            <p className="mt-base text-sm leading-6 text-body">Sign in to see your next skill, certification, resume fix, and internship action in one workspace.</p>
            {auth?.user ? <p className="mt-base rounded-md border border-hairline bg-surface-soft p-sm text-sm text-body">You are already signed in. Continue to your dashboard from the button below.</p> : null}
            <form className="mt-xl space-y-base" onSubmit={handleEmailLogin}>
            <label className="block text-sm font-medium">
              Email
              <input className="mt-xs w-full rounded-sm bg-surface-strong px-base py-sm text-ink" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input className="mt-xs w-full rounded-sm bg-surface-strong px-base py-sm text-ink" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            </label>
            {error ? <p className="rounded-sm bg-red-50 p-sm text-sm text-error">{error}</p> : null}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? 'Signing in...' : 'Login'}
            </Button>
            </form>
            <button className="mt-base flex h-11 w-full items-center justify-center gap-sm rounded-md border border-hairline bg-canvas text-sm font-medium text-ink hover:bg-surface-soft" onClick={handleGoogleLogin} type="button">
              <CircleUserRound aria-hidden="true" size={18} />
              Continue with Google
            </button>
            <p className="mt-lg text-sm text-body">
              New here?{' '}
              <Link className="font-medium text-primary hover:underline" to="/register">
                Create an account
              </Link>
            </p>
            {auth?.user ? <Button className="mt-base w-full bg-ink text-white hover:bg-primary" to="/onboarding/profile">Complete profile</Button> : null}
          </div>
        </div>
        <aside className="relative hidden overflow-hidden border-l border-hairline bg-surface-dark md:block">
          <img alt="Indian student working on a laptop while planning career steps" className="h-full w-full object-cover opacity-80" src={authPhoto} />
          <div className="absolute inset-x-lg bottom-lg rounded-lg border border-surface-dark-elevated bg-surface-dark p-lg">
            <p className="font-display text-2xl font-semibold text-white">Your roadmap is waiting.</p>
            <p className="mt-sm text-sm leading-6 text-muted">Pick up exactly where your skills, courses, and next applications left off.</p>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default Login
