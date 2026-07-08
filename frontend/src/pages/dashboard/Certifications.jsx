/*
 * Certifications renders a kanban board for tracking professional credentials.
 * It exists to give students a structured way to manage the proof artifacts hiring managers look for.
 */
import { Award, CheckCircle2, Circle, Clock, ExternalLink, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadCertifications } from '../../services/supabaseData.js'
import { getTargetRole } from '../../services/careerAnalysis.js'

function Certifications() {
  const [items, setItems] = useState([])
  const [targetRole, setTargetRole] = useState('')

  useEffect(() => {
    loadCertifications().then(setItems).catch(() => {})
    // Hacky but fast way to get the target role for the suggestions below without full profile loading block
    const storedPath = JSON.parse(localStorage.getItem('careerspark_path') || '{}')
    if (storedPath.title) setTargetRole(storedPath.title)
  }, [])

  // In a full app, this would open a modal to add a real certification to the DB.
  // For the MVP, we just add a stub to the UI.
  function handleAddMock() {
    const newItem = {
      id: Date.now(),
      title: 'New Certification',
      provider: 'Provider Name',
      status: 'planned',
      url: '#',
      earned_date: null
    }
    setItems([...items, newItem])
  }

  const columns = [
    { id: 'planned', title: 'Planned', icon: Circle, color: 'text-slate-400' },
    { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-blue-500' },
    { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  ]

  // Suggested certs based on target role (simple logic for MVP)
  const getSuggestions = () => {
    const role = targetRole.toLowerCase()
    if (role.includes('frontend')) return [{ title: 'Meta Front-End Developer', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' }]
    if (role.includes('data')) return [{ title: 'Google Data Analytics', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/google-data-analytics' }]
    if (role.includes('cloud')) return [{ title: 'AWS Certified Cloud Practitioner', provider: 'AWS', url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/' }]
    return [{ title: 'Google IT Support', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/google-it-support' }]
  }

  return (
    <div className="space-y-xl h-full flex flex-col">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas to-purple-500/5 p-xl shadow-sm shrink-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="relative flex flex-wrap items-start justify-between gap-lg">
          <div>
            <div className="inline-flex items-center gap-sm rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 mb-4">
              <Award size={14} /> Credentials
            </div>
            <h2 className="font-display text-3xl font-bold">Certifications Pipeline</h2>
            <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body">Track the formal credentials that prove your skills to employers. Move them across the board as you progress.</p>
          </div>
          <button className="inline-flex h-11 items-center gap-sm rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-primary shadow-md hover:shadow-lg transition-all" onClick={handleAddMock} type="button">
            <Plus size={16} /> Add Custom
          </button>
        </div>
      </section>

      {/* Kanban Board */}
      <div className="flex-1 min-h-[400px] overflow-x-auto pb-4">
        <div className="flex gap-lg h-full min-w-[900px]">
          {columns.map((col) => {
            const colItems = items.filter((item) => item.status === col.id)
            return (
              <div className="flex-1 rounded-2xl bg-surface-soft/50 p-base flex flex-col" key={col.id}>
                <div className="flex items-center justify-between mb-base px-2">
                  <h3 className="font-display font-bold text-ink flex items-center gap-2 text-sm uppercase tracking-wider">
                    <col.icon size={16} className={col.color} />
                    {col.title}
                  </h3>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-canvas border border-hairline text-xs font-bold text-muted">{colItems.length}</span>
                </div>
                
                <div className="flex-1 space-y-sm">
                  {colItems.length === 0 ? (
                    <div className="h-24 rounded-xl border-2 border-dashed border-hairline flex items-center justify-center text-sm text-muted">
                      No items
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <article className="group cursor-grab active:cursor-grabbing rounded-xl border border-hairline bg-canvas p-4 shadow-sm hover:border-purple-300 hover:shadow-md transition-all" key={item.id}>
                        <div className="mb-3">
                          <span className="inline-flex rounded-lg bg-surface-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted border border-hairline">{item.provider}</span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-ink leading-snug">{item.title}</h4>
                        
                        <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
                          {item.earned_date ? (
                            <span className="text-xs text-muted font-medium">Earned: {new Date(item.earned_date).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-xs text-muted font-medium">Target: Q3 2026</span>
                          )}
                          <a className="text-muted hover:text-purple-600 transition-colors" href={item.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Suggestions */}
      {targetRole && (
        <section className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink mb-base">Suggested for {targetRole}</h3>
          <div className="flex flex-wrap gap-sm">
            {getSuggestions().map((item, i) => (
              <a className="group flex items-center gap-sm rounded-xl border border-hairline bg-surface-soft px-4 py-3 hover:bg-canvas hover:border-purple-300 transition-all" href={item.url} key={i} target="_blank" rel="noreferrer">
                <div>
                  <p className="text-xs font-bold text-muted">{item.provider}</p>
                  <p className="text-sm font-semibold text-ink group-hover:text-purple-700 transition-colors">{item.title}</p>
                </div>
                <ExternalLink size={14} className="text-muted ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Certifications
