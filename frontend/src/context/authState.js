/*
 * authState stores the shared React context for Supabase authentication.
 * It exists separately so component files remain Fast Refresh friendly.
 */
import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// Reads auth state and returns the current context value.
export function useAuth() {
  return useContext(AuthContext)
}
