/*
 * API client stores backend access helpers for internal FastAPI calls.
 * It exists so future pages do not duplicate base URL handling.
 */

const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL // FastAPI base URL for browser-to-backend requests.

// Builds an internal API URL and returns an absolute URL string.
export function buildApiUrl(path) {
  const baseUrl = backendUrl || 'http://localhost:8000'
  return `${baseUrl}${path}`
}

// Calls a JSON backend endpoint and returns the parsed response body.
async function requestJson(path, options = {}) {
  const response = await fetch(buildApiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: 'The request failed. Check the backend logs and try again.' }))
    let errorMessage = payload.detail || 'The request failed. Check the backend logs and try again.'
    if (Array.isArray(errorMessage)) {
      errorMessage = 'Validation Error: ' + errorMessage.map(e => e.msg).join(', ')
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

// Calls POST /chatbot/ask with a student question and returns an AI answer object.
export function askChatbot(payload) {
  return requestJson('/chatbot/ask', { method: 'POST', body: JSON.stringify(payload) })
}

// Calls POST /roadmap/generate with profile context and returns a roadmap response.
export function generateRoadmap(payload) {
  return requestJson('/roadmap/generate', { method: 'POST', body: JSON.stringify(payload) })
}

// Calls POST /assessment/analyze with questionnaire answers and returns ranked matches.
export function analyzeAssessment(payload) {
  return requestJson('/assessment/analyze', { method: 'POST', body: JSON.stringify(payload) })
}

// Calls GET /internships/search with query params and returns paginated internships.
export function searchInternships(params) {
  const query = new URLSearchParams(params).toString()
  return requestJson(`/internships/search?${query}`)
}

// Calls GET /profiles/{provider}/{username} and returns normalized coding profile data.
export function fetchCodingProfile(provider, username) {
  return requestJson(`/profiles/${provider}/${username}`)
}

// Calls POST /resume/analyze with extracted resume text and returns ATS feedback.
export function analyzeResume(payload) {
  return requestJson('/resume/analyze', { method: 'POST', body: JSON.stringify(payload) })
}

// Calls POST /resume/analyze-file with a PDF/DOCX/TXT file and returns ATS feedback.
export async function analyzeResumeFile(file, targetRole = 'Frontend Development') {
  const body = new FormData()
  body.append('file', file)
  body.append('target_role', targetRole)
  let response
  try {
    response = await fetch(buildApiUrl('/resume/analyze-file'), { method: 'POST', body })
  } catch {
    throw new Error(`Could not reach the resume analyzer at ${buildApiUrl('/resume/analyze-file')}. Check that the backend is running and CORS allows this browser origin.`)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: 'The resume file could not be analyzed.' }))
    throw new Error(payload.detail || 'The resume file could not be analyzed.')
  }
  return response.json()
}

// Calls POST /interview/feedback with transcript data and returns coaching feedback.
export function getInterviewFeedback(payload) {
  return requestJson('/interview/feedback', { method: 'POST', body: JSON.stringify(payload) })
}

let analysisCachePromise = null
let analysisCachePayloadStr = null

export function fetchDashboardAnalysis(payload, forceRefresh = false) {
  const payloadStr = JSON.stringify(payload)
  
  if (!forceRefresh) {
    if (analysisCachePromise && analysisCachePayloadStr === payloadStr) {
      return analysisCachePromise
    }
    
    const cached = localStorage.getItem('analysis_cache_' + payloadStr)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        return Promise.resolve(parsed)
      } catch(e) {}
    }
  }
  
  analysisCachePayloadStr = payloadStr
  analysisCachePromise = requestJson('/analysis/dashboard', { method: 'POST', body: payloadStr }).then(res => {
    try { localStorage.setItem('analysis_cache_' + payloadStr, JSON.stringify(res)) } catch(e) {}
    return res
  }).catch((err) => {
    analysisCachePromise = null // Clear cache on error so it can be retried
    throw err
  })
  
  return analysisCachePromise
}
