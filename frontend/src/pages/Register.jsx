/*
 * Register renders the split-screen Supabase-ready account creation page.
 * It exists to create a student session before the mandatory profile wizard.
 */
import { CircleUserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import authPhoto from '../assets/student-roadmap-login.jpg'
import Button from '../components/ui/Button.jsx'
import { supabase } from '../services/supabaseClient.js'
import { useState } from 'react'
import PublicNav from '../components/layout/PublicNav.jsx'

// Renders the registration form and returns a Supabase signup flow.
function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  // Updates one form field and returns the next form state.
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  // Creates an account with Supabase and returns the onboarding profile route.
  async function handleRegister(event) {
    event.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured yet. Fill frontend/.env, then restart Vite.')
      return
    }
    setLoading(true)
    setError('')
    setNotice('')
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    })
    setLoading(false)
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    if (!data.session) {
      setNotice('Account created. Check your email to confirm it, then log in.')
      return
    }
    navigate('/onboarding/profile', { replace: true })
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
            <p className="mt-xl inline-flex rounded-sm border border-hairline px-sm py-xs text-xs font-medium uppercase tracking-[0.04em] text-body">Start free</p>
            <h1 className="mt-lg font-display text-5xl font-semibold leading-[1.05]">Create your roadmap account.</h1>
            <p className="mt-base text-sm leading-6 text-body">Set up once, then move through profile, assessment, and dashboard without losing context.</p>
            <form className="mt-xl space-y-base" onSubmit={handleRegister}>
            <label className="block text-sm font-medium">
              Full name
              <input className="mt-xs w-full rounded-sm bg-surface-strong px-base py-sm text-ink" onChange={(event) => updateField('name', event.target.value)} required value={form.name} />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input className="mt-xs w-full rounded-sm bg-surface-strong px-base py-sm text-ink" onChange={(event) => updateField('email', event.target.value)} required type="email" value={form.email} />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input className="mt-xs w-full rounded-sm bg-surface-strong px-base py-sm text-ink" minLength={8} onChange={(event) => updateField('password', event.target.value)} required type="password" value={form.password} />
            </label>
            {error ? <p className="rounded-sm bg-red-50 p-sm text-sm text-error">{error}</p> : null}
            {notice ? <p className="rounded-sm bg-primary-tint p-sm text-sm text-primary">{notice}</p> : null}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
            </form>
            <button className="mt-base flex h-11 w-full items-center justify-center gap-sm rounded-md border border-hairline bg-canvas text-sm font-medium text-ink hover:bg-surface-soft" onClick={handleGoogleLogin} type="button">
              <CircleUserRound aria-hidden="true" size={18} />
              Continue with Google
            </button>
            <p className="mt-lg text-sm text-body">
              Already have an account?{' '}
              <Link className="font-medium text-primary hover:underline" to="/login">
                Login
              </Link>
            </p>
          </div>
        </div>
        <aside className="relative hidden overflow-hidden border-l border-hairline bg-surface-dark md:block">
          <img alt="Indian student using a laptop outdoors before starting a career roadmap" className="h-full w-full object-cover opacity-80" src={authPhoto} />
          <div className="absolute inset-x-lg bottom-lg rounded-lg border border-surface-dark-elevated bg-surface-dark p-lg">
            <p className="font-display text-2xl font-semibold text-white">Your first 90 days can be clear.</p>
            <p className="mt-sm text-sm leading-6 text-muted">Set up your profile once, then let CareerSpark organize the path.</p>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default Register
