/*
 * AuthContext tracks the Supabase session and authenticated user.
 * It exists so protected routes, navigation, and data services share one auth source.
 */
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'
import { AuthContext } from './authState.js'

// Provides Supabase auth state and returns children with session context.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user || null)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user || null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({ configured: Boolean(supabase), loading, session, user }), [loading, session, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
