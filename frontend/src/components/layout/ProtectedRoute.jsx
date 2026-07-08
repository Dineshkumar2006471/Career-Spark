/*
 * ProtectedRoute guards authenticated CareerSpark screens.
 * It exists so Supabase-configured builds redirect anonymous users to login.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authState.js'
import { useEffect, useState } from 'react'
import { loadProfile } from '../../services/supabaseData.js'
import { hasOnboardingComplete, markOnboardingComplete } from '../../services/onboardingState.js'

// Guards private routes and returns either children or the login redirect.
function ProtectedRoute({ children }) {
  const auth = useAuth()
  const location = useLocation()
  const [profileChecked, setProfileChecked] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    if (!auth?.configured || !auth.user || !location.pathname.startsWith('/dashboard')) {
      setProfileChecked(true)
      return
    }
    const recentlyCompleted = hasOnboardingComplete(auth.user.id)
    setProfileComplete(recentlyCompleted)
    setProfileChecked(recentlyCompleted)
    loadProfile()
      .then((profile) => {
        const complete = Boolean(profile?.onboarding_completed)
        setProfileComplete(complete || recentlyCompleted)
        if (complete) markOnboardingComplete(auth.user.id)
      })
      .catch(() => setProfileComplete(recentlyCompleted))
      .finally(() => setProfileChecked(true))
  }, [auth?.configured, auth?.user, location.pathname])

  if (auth?.loading) {
    return <main className="grid min-h-screen place-items-center bg-page-warm text-ink">Checking your session...</main>
  }

  if (auth?.configured && !auth.user) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (!profileChecked) {
    return <main className="grid min-h-screen place-items-center bg-page-warm text-ink">Checking your profile...</main>
  }

  if (auth?.configured && auth.user && location.pathname.startsWith('/dashboard') && !profileComplete) {
    return <Navigate replace to="/onboarding/profile" />
  }

  return children
}

export default ProtectedRoute
