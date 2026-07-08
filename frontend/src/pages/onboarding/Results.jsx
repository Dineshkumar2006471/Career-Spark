/*
 * Results shows ranked career path suggestions after the assessment.
 * It exists so students can compare options before choosing a primary path.
 */
import { Link } from 'react-router-dom'
import MatchCompass from '../../components/ui/MatchCompass.jsx'
import { careerPaths } from '../../data/sampleData.js'
import PublicNav from '../../components/layout/PublicNav.jsx'
import { useMemo } from 'react'

// Renders assessment results and returns path-comparison cards.
function Results() {
  const results = useMemo(() => {
    const stored = JSON.parse(localStorage.getItem('careerspark_assessment') || 'null')
    return Array.isArray(stored?.results) && stored.results.length ? stored.results : careerPaths
  }, [])

  return (
    <main className="min-h-screen bg-page-warm text-ink">
      <PublicNav />
      <section className="mx-auto max-w-[1120px]">
        <p className="inline-flex rounded-sm border border-hairline bg-canvas px-sm py-xs text-xs font-medium uppercase tracking-[0.04em] text-body">Your matches</p>
        <h1 className="mt-lg max-w-3xl font-display text-5xl font-semibold leading-[1.05]">Three paths worth exploring.</h1>
        <div className="mt-xl grid gap-lg lg:grid-cols-3">
          {results.map((path) => (
            <article className="rounded-lg border border-hairline bg-canvas p-lg" key={path.id}>
              <MatchCompass label={path.title} score={path.match} status="Career fit" />
              <p className="mt-base text-sm leading-6 text-body">{path.summary}</p>
              <div className="mt-base grid gap-xs text-sm">
                <p><span className="font-medium text-ink">Salary:</span> {path.salary}</p>
                <p><span className="font-medium text-ink">Outlook:</span> {path.outlook}</p>
              </div>
            </article>
          ))}
        </div>
        <Link className="mt-xl inline-flex h-11 items-center rounded-md bg-ink px-lg text-sm font-medium text-white hover:bg-primary" to="/onboarding/choose">
          Choose primary path
        </Link>
      </section>
    </main>
  )
}

export default Results
