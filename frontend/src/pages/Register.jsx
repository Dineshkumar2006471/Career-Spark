/*
 * Register renders the split-screen Supabase-ready account creation page.
 * It exists to create a student session before the mandatory profile wizard.
 */
import { CircleUserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import authPhoto from '../assets/student-collaboration.jpg'
import logo from '../assets/logo.png'
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
            <Link className="inline-block" to="/">
              <img src={logo} alt="CareerSpark Logo" className="h-12 w-auto" />
            </Link>
            <p className="mt-xl inline-flex rounded-sm border border-hairline px-sm py-xs text-xs font-medium uppercase tracking-[0.04em] text-body">Start free</p>
            <h1 className="mt-lg font-display text-5xl font-semibold leading-[1.05]">Create your roadmap account.</h1>
            <p className="mt-base text-sm leading-6 text-body">Set up once, then move through profile, assessment, and dashboard without losing context.</p>
            <form className="mt-xl space-y-base" onSubmit={handleRegister}>
            <label className="block text-sm font-medium">
              Full name
              <input className="mt-xs h-11 w-full rounded-xl border border-hairline bg-canvas px-base text-ink outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-sm" onChange={(event) => updateField('name', event.target.value)} required value={form.name} />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input className="mt-xs h-11 w-full rounded-xl border border-hairline bg-canvas px-base text-ink outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-sm" onChange={(event) => updateField('email', event.target.value)} required type="email" value={form.email} />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input className="mt-xs h-11 w-full rounded-xl border border-hairline bg-canvas px-base text-ink outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-sm" minLength={8} onChange={(event) => updateField('password', event.target.value)} required type="password" value={form.password} />
            </label>
            {error ? <p className="rounded-sm bg-red-50 p-sm text-sm text-error">{error}</p> : null}
            {notice ? <p className="rounded-sm bg-primary-tint p-sm text-sm text-primary">{notice}</p> : null}
            <button className="h-11 w-full rounded-xl bg-ink text-white text-sm font-semibold shadow-md hover:bg-primary transition-all" disabled={loading} type="submit">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            </form>
            <button className="mt-base flex h-11 w-full items-center justify-center gap-sm rounded-xl border border-hairline bg-white text-sm font-medium text-ink hover:bg-surface-soft shadow-sm transition-all" onClick={handleGoogleLogin} type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
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
