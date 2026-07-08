/*
 * supabaseData contains browser-side CRUD helpers for RLS-protected CareerSpark tables.
 * It exists so pages can persist real user data while keeping demo fallbacks when Supabase is not configured.
 */
import { supabase } from './supabaseClient.js'

// Returns true when the browser Supabase client is configured.
export function hasSupabase() {
  return Boolean(supabase)
}

// Gets the authenticated user from Supabase Auth and returns null when unavailable.
export async function getCurrentUser() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  return data.user
}

// Upserts a row owned by the current user and returns the saved row.
async function upsertOwned(table, payload, conflictTarget = 'user_id') {
  const user = await getCurrentUser()
  if (!user) throw new Error('Your login session was not available while saving. Please log in again.')
  const { data, error } = await supabase.from(table).upsert({ ...payload, user_id: user.id }, { onConflict: conflictTarget }).select().single()
  if (error) throw new Error(error.message)
  return data
}

// Selects rows owned by the current user and returns an array.
async function selectOwned(table, columns = '*') {
  const user = await getCurrentUser()
  if (!user) return []
  const { data, error } = await supabase.from(table).select(columns).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  return data || []
}

// Saves the profile wizard data and returns the stored profile row.
export function saveProfile(profile) {
  return upsertOwned('profile', {
    first_name: profile.firstName,
    last_name: profile.lastName,
    phone: profile.phone,
    email: profile.email,
    full_address: profile.fullAddress,
    city: profile.city,
    state: profile.state,
    location_label: profile.locationLabel,
    latitude: profile.location?.[0] || null,
    longitude: profile.location?.[1] || null,
    institution: profile.institution,
    current_course: profile.currentCourse,
    branch: profile.branch,
    current_year: profile.year,
    skills: profile.skills || [],
    projects: profile.projects || [],
    applications: profile.applications || [],
    achievements: profile.achievements || [],
    experience_items: profile.experienceItems || [],
    resume_file_name: profile.resumeFileName,
    resume_feedback: profile.resumeFeedback || {},
    goal_note: profile.goal,
    github_url: profile.github,
    linkedin_url: profile.linkedin,
    portfolio_url: profile.portfolio,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  })
}

// Loads the user's profile row and returns null when not found.
export async function loadProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase.from('profile').select('*').eq('user_id', user.id).maybeSingle()
  if (error) throw new Error(error.message)
  return data || null
}

// Saves assessment answers/results and returns the inserted assessment row.
export async function saveAssessment(answers, results) {
  const user = await getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase.from('career_assessments').insert({ user_id: user.id, answers, results }).select().single()
  if (error) throw new Error(error.message)
  return data
}

// Loads the latest assessment and returns null when no assessment exists.
export async function loadLatestAssessment() {
  const user = await getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase.from('career_assessments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

// Saves the primary roadmap path and returns the stored roadmap row.
export function saveRoadmapChoice(path, phases = []) {
  return upsertOwned('roadmap', {
    career_path: path.title,
    phases,
    progress_percent: 34,
  })
}

// Loads roadmap rows and returns the newest roadmap or null.
export async function loadRoadmap() {
  const rows = await selectOwned('roadmap')
  return rows[0] || null
}

// Upserts skill progress rows and returns the saved rows.
export async function saveSkillProgress(items) {
  const user = await getCurrentUser()
  if (!user || !items.length) return []
  const rows = items.map(([skillName, currentLevel, targetLevel]) => ({
    user_id: user.id,
    skill_name: skillName,
    current_level: currentLevel,
    target_level: targetLevel,
  }))
  const { data, error } = await supabase.from('skill_progress').upsert(rows, { onConflict: 'user_id,skill_name' }).select()
  if (error) throw new Error(error.message)
  return data || []
}

// Loads skill progress and returns persisted rows.
export function loadSkillProgress() {
  return selectOwned('skill_progress')
}

// Loads certification tracker rows and returns persisted rows.
export function loadCertifications() {
  return selectOwned('certifications')
}

// Replaces certification tracker rows and returns the saved rows.
export async function saveCertifications(items) {
  const user = await getCurrentUser()
  if (!user) return []
  const rows = items.map((item) => ({
    user_id: user.id,
    title: item.title,
    provider: item.provider,
    status: item.status,
    url: item.url || null,
  }))
  const { error: deleteError } = await supabase.from('certifications').delete().eq('user_id', user.id)
  if (deleteError) throw new Error(deleteError.message)
  const { data, error } = await supabase.from('certifications').insert(rows).select()
  if (error) throw new Error(error.message)
  return data || []
}

// Saves resume analysis history and returns the inserted resume version.
export async function saveResumeVersion(fileName, score, feedback) {
  const user = await getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase.from('resume_versions').insert({ user_id: user.id, file_name: fileName, ats_score: score, feedback }).select().single()
  if (error) throw new Error(error.message)
  return data
}

// Loads resume score history and returns sorted rows.
export async function loadResumeVersions() {
  const user = await getCurrentUser()
  if (!user) return []
  const { data, error } = await supabase.from('resume_versions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

// Saves a coding profile integration result and returns the stored row.
export function saveProfileIntegration(provider, username, stats) {
  return upsertOwned('profile_integrations', { provider, username, stats }, 'user_id,provider')
}

// Loads saved coding integrations and returns persisted rows.
export function loadProfileIntegrations() {
  return selectOwned('profile_integrations')
}

// Saves an interview transcript and feedback and returns the inserted row.
export async function saveInterviewSession(prompt, transcript, feedback) {
  const user = await getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase.from('interview_sessions').insert({ user_id: user.id, prompt, transcript, feedback }).select().single()
  if (error) throw new Error(error.message)
  return data
}

// Subscribes to owned table changes and returns an unsubscribe function.
export async function subscribeToUserTable(table, onChange) {
  const user = await getCurrentUser()
  if (!supabase || !user) return () => {}
  const channel = supabase
    .channel(`${table}-${user.id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${user.id}` }, onChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
