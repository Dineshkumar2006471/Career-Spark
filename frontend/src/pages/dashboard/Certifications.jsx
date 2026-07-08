/*
 * Certifications renders recommended and tracked certificate progress.
 * It exists to prioritize recognized, free or low-cost credentials.
 */
import { useEffect, useState } from 'react'
import { certifications } from '../../data/sampleData.js'
import { loadCertifications, saveCertifications } from '../../services/supabaseData.js'

const statusOrder = ['recommended', 'in-progress', 'completed']

// Converts sample tuples into tracker objects and returns a stable list.
function buildDefaultCertifications() {
  return certifications.map(([title, provider, status]) => ({ title, provider, status, url: '' }))
}

// Renders certification cards and returns progress labels.
function Certifications() {
  const [items, setItems] = useState(buildDefaultCertifications)
  const [status, setStatus] = useState('')

  useEffect(() => {
    loadCertifications()
      .then((rows) => {
        if (rows.length) setItems(rows)
      })
      .catch((error) => setStatus(error.message))
  }, [])

  // Cycles one certificate status and persists the updated tracker rows.
  async function cycleStatus(title) {
    const nextItems = items.map((item) => {
      if (item.title !== title) return item
      const nextIndex = (statusOrder.indexOf(item.status) + 1) % statusOrder.length
      return { ...item, status: statusOrder[nextIndex] }
    })
    setItems(nextItems)
    try {
      await saveCertifications(nextItems)
      setStatus('Certification progress saved.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-display text-3xl font-semibold">Certifications Tracker</h2>
        <p className="mt-sm text-sm text-body">Click a card to move it from recommended to in-progress to completed.</p>
      </div>
      {status ? <p className="rounded-sm bg-primary-tint p-sm text-sm text-primary">{status}</p> : null}
      <div className="grid gap-lg lg:grid-cols-3">
        {items.map(({ title, provider, status }) => (
          <button className="rounded-lg border border-hairline bg-canvas p-lg text-left hover:bg-surface-soft" key={title} onClick={() => cycleStatus(title)} type="button">
            <span className="rounded-sm bg-primary-tint px-sm py-xs text-xs font-medium uppercase tracking-[0.04em] text-primary">{status}</span>
            <h3 className="mt-lg font-display text-lg font-semibold">{title}</h3>
            <p className="mt-xs text-sm text-body">{provider}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Certifications
