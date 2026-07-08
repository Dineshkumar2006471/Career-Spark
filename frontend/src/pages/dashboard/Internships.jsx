/*
 * Internships renders real listing results from backend integrations.
 * It exists to surface Adzuna and Remotive opportunities with pagination-safe UI.
 */
import { useEffect, useState } from 'react'
import { searchInternships } from '../../services/apiClient.js'
import { loadProfile, loadRoadmap } from '../../services/supabaseData.js'

// Renders internship discovery and returns provider listing cards.
function Internships() {
  const [jobs, setJobs] = useState([])
  const [status, setStatus] = useState('Loading fresher-friendly internships...')

  useEffect(() => {
    Promise.all([loadProfile(), loadRoadmap()])
      .then(([profile, roadmap]) => {
        const query = `${roadmap?.career_path || profile?.current_course || 'student'} intern`
        const location = profile?.city || profile?.state || 'India'
        return searchInternships({ query, location, page: '1', page_size: '10' })
      })
      .then((data) => {
        setJobs(data.items || [])
        setStatus(data.items?.length ? 'Live results from configured providers.' : 'No live internship results returned for this profile yet.')
      })
      .catch((error) => setStatus(error.message))
  }, [])

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-display text-3xl font-semibold">Internship Discovery</h2>
        <p className="mt-xs text-sm text-body">{status}</p>
      </div>
      <div className="grid gap-lg">
        {!jobs.length ? <p className="rounded-lg border border-hairline bg-canvas p-lg text-sm text-body">Add more profile skills or broaden your location, then refresh this page. Remotive works without credentials; Adzuna will join once the App ID is configured.</p> : null}
        {jobs.map((job) => (
          <article className="rounded-lg border border-hairline bg-canvas p-lg" key={`${job.source}-${job.title}-${job.company}`}>
            <p className="text-xs font-medium uppercase tracking-[0.04em] text-primary">{job.source}</p>
            <h3 className="mt-xs font-display text-lg font-semibold">{job.title}</h3>
            <p className="mt-xs text-sm text-body">{job.company} / {job.location}</p>
            <p className="mt-sm text-sm leading-6 text-body">{job.description}</p>
            <a className="mt-base inline-flex text-sm font-medium text-primary hover:underline" href={job.url} rel="noreferrer" target="_blank">View listing</a>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Internships
