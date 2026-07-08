/*
 * onboardingState stores the local completion signal used immediately after
 * profile creation while Supabase data reloads.
 */

function completionKey(userId) {
  return `careerspark_onboarding_complete_${userId}`
}

// Marks onboarding complete for the current browser session and reloads.
export function markOnboardingComplete(userId) {
  if (!userId) return
  const value = JSON.stringify({ completedAt: new Date().toISOString() })
  sessionStorage.setItem(completionKey(userId), value)
  localStorage.setItem(completionKey(userId), value)
}

// Returns true when the current user has a verified local completion marker.
export function hasOnboardingComplete(userId) {
  if (!userId) return false
  return Boolean(sessionStorage.getItem(completionKey(userId)) || localStorage.getItem(completionKey(userId)))
}

// Clears completion state when the user signs out.
export function clearOnboardingComplete(userId) {
  if (!userId) return
  sessionStorage.removeItem(completionKey(userId))
  localStorage.removeItem(completionKey(userId))
}
