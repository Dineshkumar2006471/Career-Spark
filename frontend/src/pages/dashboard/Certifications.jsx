/*
 * Certifications renders a kanban board for tracking professional credentials.
 * It exists to give students a structured way to manage the proof artifacts hiring managers look for.
 */
import { Award, CheckCircle2, Circle, Clock, ExternalLink, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadCertifications, saveCertifications } from '../../services/supabaseData.js'
import { getTargetRole } from '../../services/careerAnalysis.js'
import Button from '../../components/ui/Button.jsx'

function Certifications() {
  const [items, setItems] = useState([])
  const [targetRole, setTargetRole] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCert, setNewCert] = useState({ title: '', provider: '', url: '', status: 'planned' })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadCertifications().then(setItems).catch(() => {})
    const storedPath = JSON.parse(localStorage.getItem('careerspark_path') || '{}')
    if (storedPath.title) setTargetRole(storedPath.title)
  }, [])

  const handleSaveItems = async (newItems) => {
    setItems(newItems)
    try {
      await saveCertifications(newItems)
    } catch (err) {
      console.error('Failed to save certifications', err)
    }
  }

  const handleAddCert = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    const newItem = {
      id: Date.now().toString(), // temporary ID
      ...newCert,
      earned_date: newCert.status === 'completed' ? new Date().toISOString() : null
    }
    const updatedItems = [...items, newItem]
    await handleSaveItems(updatedItems)
    setIsModalOpen(false)
    setNewCert({ title: '', provider: '', url: '', status: 'planned' })
    setIsSaving(false)
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    const updatedItems = items.filter(item => item.id !== id && item.id !== undefined)
    await handleSaveItems(updatedItems)
  }

  // --- Drag and Drop Logic ---
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('cert_id', item.id)
  }

  const handleDragOver = (e) => {
    e.preventDefault() // Required to allow dropping
  }

  const handleDrop = async (e, columnId) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('cert_id')
    
    // Find the item and check if status changed
    const itemIndex = items.findIndex(item => item.id == itemId)
    if (itemIndex > -1 && items[itemIndex].status !== columnId) {
      const updatedItems = [...items]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        status: columnId,
        earned_date: columnId === 'completed' ? new Date().toISOString() : null
      }
      await handleSaveItems(updatedItems)
    }
  }

  const columns = [
    { id: 'planned', title: 'Planned', icon: Circle, color: 'text-slate-400' },
    { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-blue-500' },
    { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  ]

  const getSuggestions = () => {
    const role = targetRole.toLowerCase()
    if (role.includes('frontend')) return [{ title: 'Meta Front-End Developer', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' }]
    if (role.includes('data')) return [{ title: 'Google Data Analytics', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/google-data-analytics' }]
    if (role.includes('cloud')) return [{ title: 'AWS Certified Cloud Practitioner', provider: 'AWS', url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/' }]
    return [{ title: 'Google IT Support', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/google-it-support' }]
  }

  return (
    <div className="space-y-xl h-full flex flex-col relative">
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
          <button className="inline-flex h-11 items-center gap-sm rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-primary shadow-md hover:shadow-lg transition-all" onClick={() => setIsModalOpen(true)} type="button">
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
              <div 
                className="flex-1 rounded-2xl bg-surface-soft/50 p-base flex flex-col border border-transparent hover:border-purple-500/20 transition-colors" 
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
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
                      Drop items here
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <article 
                        className="group cursor-grab active:cursor-grabbing rounded-xl border border-hairline bg-canvas p-4 shadow-sm hover:border-purple-300 hover:shadow-md transition-all relative" 
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                      >
                        <div className="mb-3 flex justify-between items-start">
                          <span className="inline-flex rounded-lg bg-surface-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted border border-hairline">{item.provider}</span>
                          <button onClick={(e) => handleDelete(item.id, e)} className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h4 className="font-display font-bold text-sm text-ink leading-snug">{item.title}</h4>
                        
                        <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
                          {item.earned_date ? (
                            <span className="text-xs text-muted font-medium">Earned: {new Date(item.earned_date).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-xs text-muted font-medium">Target: Q3 2026</span>
                          )}
                          {item.url && item.url !== '#' && (
                            <a className="text-muted hover:text-purple-600 transition-colors" href={item.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              <ExternalLink size={14} />
                            </a>
                          )}
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
        <section className="rounded-2xl border border-hairline bg-canvas p-lg shadow-sm shrink-0">
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

      {/* Add Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="bg-canvas rounded-2xl border border-hairline shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-lg border-b border-hairline">
              <h3 className="font-display text-xl font-bold text-ink">Add Certification</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-ink transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCert} className="p-lg space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Certification Title</label>
                <input required type="text" value={newCert.title} onChange={e => setNewCert({...newCert, title: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-hairline bg-surface-soft text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. AWS Solutions Architect" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Provider</label>
                <input required type="text" value={newCert.provider} onChange={e => setNewCert({...newCert, provider: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-hairline bg-surface-soft text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. Amazon Web Services" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Status</label>
                <select value={newCert.status} onChange={e => setNewCert({...newCert, status: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-hairline bg-surface-soft text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">URL (Optional)</label>
                <input type="url" value={newCert.url} onChange={e => setNewCert({...newCert, url: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-hairline bg-surface-soft text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="https://..." />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Add Certification'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Certifications
