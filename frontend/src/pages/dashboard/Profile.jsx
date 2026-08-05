/*
 * Profile renders the student's read-only identity card.
 * It exists to confirm what CareerSpark knows about the student from the onboarding wizard.
 */
import { BookOpen, Briefcase, GraduationCap, Link2, MapPin, Target, Trophy, Zap, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { loadProfile, uploadAvatar, updateAvatarUrl } from '../../services/supabaseData.js'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProfile().then(setProfile).catch(() => {})
  }, [])

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadAvatar(file)
      await updateAvatarUrl(url)
      setProfile({ ...profile, avatar_url: url })
      window.dispatchEvent(new CustomEvent('profileAvatarChanged'))
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (!profile) return <div className="p-xl text-center text-body">Loading profile...</div>

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Student'
  const initials = [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join('') || 'ST'
  const location = profile.city || profile.state || profile.location_label || 'Location not set'

  return (
    <div className="space-y-xl max-w-4xl mx-auto">
      {/* LinkedIn-style Cover & Header */}
      <section className="overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-blue-500"></div>
        <div className="px-xl pb-xl relative">
          <div className="flex justify-between items-end mb-lg">
            <label className="relative h-24 w-24 rounded-2xl border-4 border-canvas bg-gradient-to-br from-primary to-blue-400 -mt-12 shadow-md flex items-center justify-center text-3xl font-bold text-white overflow-hidden cursor-pointer group">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className={`h-full w-full object-cover transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'}`} />
              ) : (
                initials
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Pencil size={20} className="text-white" />
                )}
              </div>
            </label>
            <Link className="h-10 inline-flex items-center rounded-lg border border-hairline bg-canvas px-4 text-sm font-medium text-ink hover:bg-surface-soft shadow-sm" to="/onboarding/profile?edit=1">
              Edit Profile
            </Link>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{name}</h1>
            <p className="mt-1 text-base text-body">{profile.current_course} at {profile.institution}</p>
            <p className="mt-2 text-sm text-muted flex items-center gap-1"><MapPin size={14} /> {location}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-xl lg:grid-cols-[1fr_300px]">
        <div className="space-y-xl">
          {/* Target Role & Goal */}
          <section className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold mb-base"><Target size={18} className="text-primary" /> Career Goal</h2>
            <p className="text-sm leading-relaxed text-body bg-surface-soft p-base rounded-xl border border-hairline">{profile.goal_note || 'No specific goal set.'}</p>
          </section>

          {/* Skills */}
          <section className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold mb-base"><Zap size={18} className="text-amber-500" /> Tracked Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span className="rounded-lg bg-surface-soft border border-hairline px-3 py-1.5 text-sm font-medium text-ink shadow-sm" key={index}>{skill}</span>
                ))
              ) : (
                <p className="text-sm text-muted">No skills added yet.</p>
              )}
            </div>
          </section>

          {/* Projects & Experience */}
          <section className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold mb-base"><Briefcase size={18} className="text-blue-500" /> Experience & Proof</h2>
            
            <div className="space-y-lg">
              <div>
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">Projects</h3>
                {profile.projects?.length > 0 ? (
                  <ul className="space-y-3">
                    {profile.projects.map((item, index) => (
                      <li className="flex items-start gap-3 text-sm text-body" key={index}>
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>{item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted italic">No projects listed.</p>
                )}
              </div>

              <div className="border-t border-hairline pt-lg">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">Experience Items</h3>
                {profile.experience_items?.length > 0 ? (
                  <ul className="space-y-3">
                    {profile.experience_items.map((item, index) => (
                      <li className="flex items-start gap-3 text-sm text-body" key={index}>
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0"></span>{item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted italic">No experience listed.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-xl">
          <section className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold mb-base"><GraduationCap size={18} className="text-purple-500" /> Education</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted text-xs">Institution</p>
                <p className="font-medium text-ink">{profile.institution || '—'}</p>
              </div>
              <div>
                <p className="text-muted text-xs">Course & Branch</p>
                <p className="font-medium text-ink">{profile.current_course || '—'} {profile.branch ? `(${profile.branch})` : ''}</p>
              </div>
              <div>
                <p className="text-muted text-xs">Year</p>
                <p className="font-medium text-ink">{profile.current_year || '—'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold mb-base"><Link2 size={18} className="text-green-500" /> External Links</h2>
            <div className="space-y-3 text-sm">
              <a className="flex items-center gap-2 text-primary hover:underline font-medium" href={profile.github_url || '#'} target="_blank" rel="noreferrer">
                GitHub {profile.github_url ? '' : '(Not set)'}
              </a>
              <a className="flex items-center gap-2 text-primary hover:underline font-medium" href={profile.linkedin_url || '#'} target="_blank" rel="noreferrer">
                LinkedIn {profile.linkedin_url ? '' : '(Not set)'}
              </a>
              <a className="flex items-center gap-2 text-primary hover:underline font-medium" href={profile.portfolio_url || '#'} target="_blank" rel="noreferrer">
                Portfolio {profile.portfolio_url ? '' : '(Not set)'}
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile
