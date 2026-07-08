/*
 * Profile renders coding profile integrations for GitHub, Codeforces, and LeetCode.
 * It exists to pull public skill signals into CareerSpark's analysis.
 */
import { useState } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Award, BriefcaseBusiness, FileText, GraduationCap, Link as LinkIcon, MapPin, Sparkles, UserRound } from 'lucide-react'
import { fetchCodingProfile } from '../../services/apiClient.js'
import { loadProfile, loadProfileIntegrations, saveProfileIntegration } from '../../services/supabaseData.js'

function initials(profile) {
  return `${profile?.first_name?.[0] || 'S'}${profile?.last_name?.[0] || ''}`.toUpperCase()
}

function ProfileList({ emptyLabel, items }) {
  const safeItems = Array.isArray(items) ? items : []
  if (!safeItems.length) return <p className="rounded-sm bg-surface-soft p-sm text-sm text-body">{emptyLabel}</p>
  return (
    <div className="space-y-sm">
      {safeItems.map((item) => (
        <p className="rounded-sm bg-surface-soft p-sm text-sm leading-6 text-body" key={item}>{item}</p>
      ))}
    </div>
  )
}

function DetailCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-hairline bg-canvas p-base">
      <div className="flex items-center gap-sm">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-surface-soft text-ink">
          <Icon aria-hidden="true" size={17} />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{label}</p>
          <p className="mt-xxs text-sm font-medium text-ink">{value || 'Not provided'}</p>
        </div>
      </div>
    </article>
  )
}

// Renders provider lookup controls and returns normalized profile stats.
function Profile() {
  const [provider, setProvider] = useState('github')
  const [username, setUsername] = useState('')
  const [profile, setProfile] = useState(null)
  const [studentProfile, setStudentProfile] = useState(null)
  const [message, setMessage] = useState('Connect a public coding profile to enrich your skill gap analysis.')

  useEffect(() => {
    loadProfile().then(setStudentProfile).catch(() => {})
    loadProfileIntegrations().then((rows) => {
      if (rows[0]) setProfile({ provider: rows[0].provider, username: rows[0].username, stats: rows[0].stats })
    }).catch(() => {})
  }, [])

  // Fetches a coding profile from the backend and returns no value.
  async function handleLookup() {
    try {
      const data = await fetchCodingProfile(provider, username)
      setProfile(data)
      await saveProfileIntegration(provider, username, data.stats)
      setMessage('Profile data loaded.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const summary = studentProfile?.goal_note || `Building a beginner-ready career profile across ${studentProfile?.current_course || 'their current course'}, projects, skills, applications, and interview preparation.`

  return (
    <div className="space-y-lg">
      {studentProfile ? (
        <section className="overflow-hidden rounded-lg border border-hairline bg-canvas">
          <div className="border-b border-hairline bg-page-warm p-xl">
            <div className="flex flex-col gap-lg md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-lg">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-ink font-mono text-3xl text-white">
                  {initials(studentProfile)}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.04em] text-body">CareerSpark profile</p>
                  <h2 className="mt-xs font-display text-4xl font-semibold leading-tight">{studentProfile.first_name} {studentProfile.last_name}</h2>
                  <p className="mt-sm max-w-2xl text-sm leading-6 text-body">{summary}</p>
                </div>
              </div>
              <Link className="inline-flex h-11 items-center justify-center rounded-md border border-hairline bg-canvas px-lg text-sm font-medium text-ink hover:bg-surface-soft" to="/onboarding/profile?edit=1">
                Update profile
              </Link>
            </div>
          </div>

          <div className="grid gap-lg p-lg lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-lg">
              <section>
                <h3 className="font-display text-xl font-semibold">Profile summary</h3>
                <div className="mt-base grid gap-base md:grid-cols-2">
                  <DetailCard icon={UserRound} label="Email" value={studentProfile.email} />
                  <DetailCard icon={MapPin} label="Location" value={studentProfile.full_address || [studentProfile.city, studentProfile.state].filter(Boolean).join(', ')} />
                  <DetailCard icon={GraduationCap} label="Current course" value={studentProfile.current_course} />
                  <DetailCard icon={FileText} label="Resume" value={studentProfile.resume_file_name || 'Not uploaded'} />
                </div>
              </section>

              <section>
                <h3 className="font-display text-xl font-semibold">Skills</h3>
                <div className="mt-base flex flex-wrap gap-sm">
                  {(studentProfile.skills || []).length ? studentProfile.skills.map((skill) => (
                    <span className="rounded-sm border border-hairline bg-surface-soft px-sm py-xs text-sm font-medium text-ink" key={skill}>{skill}</span>
                  )) : <span className="text-sm text-body">No skills added yet.</span>}
                </div>
              </section>

              <section className="grid gap-lg md:grid-cols-2">
                <div>
                  <h3 className="font-display text-xl font-semibold">Projects</h3>
                  <div className="mt-base">
                    <ProfileList emptyLabel="No projects added yet." items={studentProfile.projects} />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">Experience</h3>
                  <div className="mt-base">
                    <ProfileList emptyLabel="No experience added yet." items={studentProfile.experience_items} />
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-lg">
              <section className="rounded-lg border border-hairline bg-surface-soft p-lg">
                <h3 className="font-display text-xl font-semibold">Career proof</h3>
                <div className="mt-base grid gap-sm">
                  <DetailCard icon={BriefcaseBusiness} label="Applications" value={`${studentProfile.applications?.length || 0} tracked`} />
                  <DetailCard icon={Award} label="Achievements" value={`${studentProfile.achievements?.length || 0} added`} />
                  <DetailCard icon={Sparkles} label="Roadmap input" value={studentProfile.branch || studentProfile.institution} />
                </div>
              </section>

              <section className="rounded-lg border border-hairline bg-canvas p-lg">
                <h3 className="font-display text-xl font-semibold">Links</h3>
                <div className="mt-base space-y-sm text-sm">
                  {[
                    ['GitHub', studentProfile.github_url],
                    ['LinkedIn', studentProfile.linkedin_url],
                    ['Portfolio', studentProfile.portfolio_url],
                  ].map(([label, url]) => (
                    <p className="flex items-center gap-sm rounded-sm bg-surface-soft p-sm text-body" key={label}>
                      <LinkIcon aria-hidden="true" size={16} />
                      {url ? <a className="truncate text-ink hover:text-primary" href={url} rel="noreferrer" target="_blank">{label}</a> : <span>{label}: not provided</span>}
                    </p>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-hairline bg-canvas p-lg">
                <h3 className="font-display text-xl font-semibold">Applications</h3>
                <div className="mt-base">
                  <ProfileList emptyLabel="No applications tracked yet." items={studentProfile.applications} />
                </div>
              </section>

              <section className="rounded-lg border border-hairline bg-canvas p-lg">
                <h3 className="font-display text-xl font-semibold">Achievements</h3>
                <div className="mt-base">
                  <ProfileList emptyLabel="No achievements added yet." items={studentProfile.achievements} />
                </div>
              </section>
            </aside>
          </div>
        </section>
      ) : null}
      <section className="rounded-lg border border-hairline bg-canvas p-lg">
        <h3 className="font-display text-xl font-semibold">Coding profile integrations</h3>
        <p className="mt-xs text-sm text-body">Connect public coding profiles so CareerSpark can use real proof signals in your skill analysis.</p>
        <div className="grid gap-base md:grid-cols-[180px_1fr_auto]">
          <select className="rounded-sm bg-surface-strong px-base py-sm" onChange={(event) => setProvider(event.target.value)} value={provider}>
            <option value="github">GitHub</option>
            <option value="codeforces">Codeforces</option>
            <option value="leetcode">LeetCode</option>
          </select>
          <input className="rounded-sm bg-surface-strong px-base py-sm" onChange={(event) => setUsername(event.target.value)} placeholder="username" value={username} />
          <button className="h-11 rounded-md bg-ink px-lg text-sm font-medium text-white hover:bg-primary" onClick={handleLookup} type="button">Connect</button>
        </div>
        <p className="mt-base text-sm text-body">{message}</p>
      </section>
      {profile ? (
        <section className="grid gap-lg md:grid-cols-3">
          {Object.entries(profile.stats || {}).map(([label, value]) => (
            <article className="rounded-lg border border-hairline bg-canvas p-lg" key={label}>
              <p className="text-sm capitalize text-body">{label.replaceAll('_', ' ')}</p>
              <p className="mt-xs font-mono text-2xl text-ink">{String(value)}</p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}

export default Profile
