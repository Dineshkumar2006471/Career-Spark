/*
 * ProfileWizard collects the mandatory first-login profile details from DESIGN.md Section 7.
 * It exists to create useful student context before the dashboard and AI guidance.
 */
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import { loadProfile, saveProfile, saveResumeVersion, saveSkillProgress } from '../../services/supabaseData.js'
import PublicNav from '../../components/layout/PublicNav.jsx'
import { useAuth } from '../../context/authState.js'
import { analyzeResumeFile } from '../../services/apiClient.js'
import { markOnboardingComplete } from '../../services/onboardingState.js'

const initialForm = {
  firstName: '',
  lastName: '',
  phone: '+91 ',
  email: '',
  fullAddress: '',
  city: '',
  state: '',
  locationLabel: '',
  institution: '',
  currentCourse: '',
  branch: '',
  year: '',
  skillsText: '',
  projectsText: '',
  applicationsText: '',
  achievementsText: '',
  experienceText: '',
  resumeFileName: '',
  resumeFeedback: {},
  github: '',
  linkedin: '',
  portfolio: '',
  targetRole: '',
  goal: '',
}

// Renders one text input and returns a labeled control.
function Field({ label, value, onChange, type = 'text', readOnly = false }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      <input className="mt-xs w-full rounded-sm bg-surface-strong px-base py-sm text-ink" onChange={(event) => onChange(event.target.value)} readOnly={readOnly} type={type} value={value} />
    </label>
  )
}

// Renders one textarea and returns a labeled control.
function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      <textarea className="mt-xs min-h-28 w-full rounded-sm bg-surface-strong px-base py-sm text-ink" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} />
    </label>
  )
}

// Converts comma/newline text into a clean string array.
function parseList(value) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function stringifyList(value) {
  return Array.isArray(value) ? value.join('\n') : ''
}

// Renders the multi-step profile wizard and returns the dashboard route on completion.
function ProfileWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const auth = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [location, setLocation] = useState([20.5937, 78.9629])
  const [message, setMessage] = useState('')
  const [resumeStatus, setResumeStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const editMode = searchParams.get('edit') === '1'
  const steps = ['Identity', 'Location', 'Education', 'Proof', 'Goals']

  useEffect(() => {
    if (auth?.user?.email) updateField('email', auth.user.email)
  }, [auth?.user?.email])

  useEffect(() => {
    if (!auth?.user) {
      setProfileLoading(false)
      return
    }
    setProfileLoading(true)
    loadProfile()
      .then((savedProfile) => {
        if (!savedProfile) return
        if (savedProfile.onboarding_completed && !editMode) {
          markOnboardingComplete(auth.user.id)
          navigate('/dashboard', { replace: true })
          return
        }
        setForm((current) => ({
          ...current,
          firstName: savedProfile.first_name || '',
          lastName: savedProfile.last_name || '',
          phone: savedProfile.phone || '+91 ',
          email: savedProfile.email || auth.user.email || '',
          fullAddress: savedProfile.full_address || '',
          city: savedProfile.city || '',
          state: savedProfile.state || '',
          locationLabel: savedProfile.location_label || '',
          institution: savedProfile.institution || '',
          currentCourse: savedProfile.current_course || '',
          branch: savedProfile.branch || '',
          year: savedProfile.current_year || '',
          skillsText: stringifyList(savedProfile.skills),
          projectsText: stringifyList(savedProfile.projects),
          applicationsText: stringifyList(savedProfile.applications),
          achievementsText: stringifyList(savedProfile.achievements),
          experienceText: stringifyList(savedProfile.experience_items),
          resumeFileName: savedProfile.resume_file_name || '',
          resumeFeedback: savedProfile.resume_feedback || {},
          github: savedProfile.github_url || '',
          linkedin: savedProfile.linkedin_url || '',
          portfolio: savedProfile.portfolio_url || '',
          targetRole: savedProfile.goal_note?.match(/Target role:\s*([^|]+)/i)?.[1]?.trim() || '',
          goal: savedProfile.goal_note?.replace(/Target role:\s*[^|]+\|?\s*/i, '') || '',
        }))
        if (savedProfile.latitude && savedProfile.longitude) {
          setLocation([savedProfile.latitude, savedProfile.longitude])
        }
        if (savedProfile.resume_file_name) setResumeStatus('Uploaded')
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setProfileLoading(false))
  }, [auth?.user, editMode, navigate])

  // Updates a profile field and returns the next form state.
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  // Reads browser geolocation and returns the selected latitude/longitude.
  function detectLocation() {
    navigator.geolocation?.getCurrentPosition((position) => {
      setLocation([position.coords.latitude, position.coords.longitude])
    })
  }

  // Accepts the uploaded resume and processes analysis in the background.
  async function handleResumeUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    updateField('resumeFileName', file.name)
    setResumeStatus('Uploading resume...')
    try {
      const result = await analyzeResumeFile(file, 'Student career profile')
      updateField('resumeFeedback', { score: result.score, suggestions: result.suggestions })
      await saveResumeVersion(file.name, result.score, { suggestions: result.suggestions })
      setResumeStatus('Uploaded')
    } catch (error) {
      updateField('resumeFeedback', { processingError: error.message })
      setResumeStatus('Uploaded')
    }
  }

  // Stores profile context locally and in Supabase before returning the dashboard route.
  async function finishSetup() {
    const skills = parseList(form.skillsText)
    const profile = {
      ...form,
      location,
      skills,
      projects: parseList(form.projectsText),
      applications: parseList(form.applicationsText),
      achievements: parseList(form.achievementsText),
      experienceItems: parseList(form.experienceText),
      goal: [form.targetRole ? `Target role: ${form.targetRole}` : '', form.goal].filter(Boolean).join(' | '),
    }
    try {
      setLoading(true)
      const savedProfile = await saveProfile(profile)
      if (!savedProfile) {
        throw new Error('Profile was not saved. Please log in again and retry.')
      }
      if (!savedProfile.onboarding_completed) {
        throw new Error('Profile saved, but onboarding was not marked complete. Please try again.')
      }
      if (auth?.user?.id) {
        markOnboardingComplete(auth.user.id)
      }
      if (skills.length) {
        saveSkillProgress(skills.map((skill) => [skill, 40, 85])).catch(() => {})
      }
      localStorage.setItem('careerspark_profile', JSON.stringify(profile))
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-page-warm text-ink">
      <PublicNav />
      <section className="mx-auto max-w-[920px] rounded-lg border border-hairline bg-canvas p-xl">
        {profileLoading ? (
          <div className="rounded-md border border-hairline bg-surface-soft p-base text-sm text-body">Checking your saved profile...</div>
        ) : (
          <>
        <p className="inline-flex rounded-sm border border-hairline px-sm py-xs text-xs font-medium uppercase tracking-[0.04em] text-body">First login setup</p>
        <h1 className="mt-lg max-w-2xl font-display text-5xl font-semibold leading-[1.05]">Build the profile your roadmap needs.</h1>
        <p className="mt-base max-w-2xl text-sm leading-6 text-body">This official student profile powers dashboard analytics, roadmap suggestions, internship search, resume feedback, and assistant answers.</p>
        <div className="mt-lg grid grid-cols-5 gap-sm">
          {steps.map((label, index) => (
            <div className={`h-2 rounded-sm ${index <= step ? 'bg-primary' : 'bg-surface-strong'}`} key={label} />
          ))}
        </div>

        <div className="mt-xl rounded-lg border border-hairline bg-white p-lg">
          <div className="space-y-lg">
          {step === 0 ? (
            <div className="grid gap-base md:grid-cols-2">
              <div className="rounded-lg border border-hairline bg-surface-soft p-base text-sm text-body md:col-span-2">
                This profile becomes the source for dashboard analytics, roadmap generation, internship filtering, and assistant context.
              </div>
              <Field label="First name" onChange={(value) => updateField('firstName', value)} value={form.firstName} />
              <Field label="Last name" onChange={(value) => updateField('lastName', value)} value={form.lastName} />
              <Field label="Phone number" onChange={(value) => updateField('phone', value)} value={form.phone} />
              <Field label="Email ID" onChange={(value) => updateField('email', value)} readOnly={Boolean(auth?.user?.email)} type="email" value={form.email} />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-base">
              <Field label="Full address" onChange={(value) => updateField('fullAddress', value)} value={form.fullAddress} />
              <div className="grid gap-base md:grid-cols-2">
                <Field label="City" onChange={(value) => updateField('city', value)} value={form.city} />
                <Field label="State" onChange={(value) => updateField('state', value)} value={form.state} />
                <Field label="Location label" onChange={(value) => updateField('locationLabel', value)} value={form.locationLabel} />
              </div>
              <button className="h-11 rounded-md border border-hairline px-lg text-sm font-medium text-ink hover:bg-surface-soft" onClick={detectLocation} type="button">
                Use browser location
              </button>
              <div className="h-72 overflow-hidden rounded-lg border border-hairline">
                <MapContainer center={location} className="h-full w-full" key={location.join(',')} zoom={6}>
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <CircleMarker center={location} fillColor="var(--color-primary)" fillOpacity={1} pathOptions={{ color: 'var(--color-primary)' }} radius={8} />
                </MapContainer>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-base md:grid-cols-2">
              <Field label="Institution name" onChange={(value) => updateField('institution', value)} value={form.institution} />
              <Field label="Current course" onChange={(value) => updateField('currentCourse', value)} value={form.currentCourse} />
              <Field label="Branch / Specialization" onChange={(value) => updateField('branch', value)} value={form.branch} />
              <Field label="Current year" onChange={(value) => updateField('year', value)} value={form.year} />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-base md:grid-cols-2">
              <TextArea label="Skills" onChange={(value) => updateField('skillsText', value)} placeholder="React, Python, Excel, SQL" value={form.skillsText} />
              <TextArea label="Projects" onChange={(value) => updateField('projectsText', value)} placeholder="Portfolio website, data dashboard, college app" value={form.projectsText} />
              <TextArea label="Applications" onChange={(value) => updateField('applicationsText', value)} placeholder="Frontend intern at X, Data intern at Y" value={form.applicationsText} />
              <TextArea label="Achievements" onChange={(value) => updateField('achievementsText', value)} placeholder="Hackathon finalist, course certificate, top project" value={form.achievementsText} />
              <TextArea label="Experience" onChange={(value) => updateField('experienceText', value)} placeholder="Freelance site, campus volunteer, internship, club role" value={form.experienceText} />
              <label className="block rounded-md border border-dashed border-hairline bg-surface-soft p-base text-sm font-medium text-ink">
                Resume upload
                <input accept=".pdf,.docx,.txt" className="mt-sm block w-full text-sm text-body" onChange={handleResumeUpload} type="file" />
                {resumeStatus ? <span className="mt-sm block text-body">{resumeStatus}</span> : null}
              </label>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-base">
              <Field label="GitHub URL" onChange={(value) => updateField('github', value)} value={form.github} />
              <Field label="LinkedIn URL" onChange={(value) => updateField('linkedin', value)} value={form.linkedin} />
              <Field label="Portfolio URL" onChange={(value) => updateField('portfolio', value)} value={form.portfolio} />
              <Field label="Target role" onChange={(value) => updateField('targetRole', value)} value={form.targetRole} />
              <TextArea label="What are you hoping to figure out?" onChange={(value) => updateField('goal', value)} placeholder="Example: I want a beginner-friendly path into frontend jobs while studying BCA." value={form.goal} />
            </div>
          ) : null}
          </div>
        </div>

        <div className="mt-xl flex justify-between">
          <button className="h-11 rounded-md border border-hairline px-lg text-sm font-medium text-ink disabled:text-muted" disabled={step === 0} onClick={() => setStep((current) => current - 1)} type="button">
            Back
          </button>
          {step < 4 ? <Button onClick={() => setStep((current) => current + 1)}>Continue</Button> : <Button disabled={loading} onClick={finishSetup}>{loading ? 'Saving...' : 'Finish setup'}</Button>}
        </div>
        {message ? <p className="mt-base rounded-md border border-hairline bg-surface-soft p-sm text-sm text-body">{message}</p> : null}
          </>
        )}
      </section>
    </main>
  )
}

export default ProfileWizard
