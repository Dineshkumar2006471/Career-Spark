/*
 * Assessment renders the career questionnaire from the onboarding flow.
 * It exists to translate student interests into ranked career path suggestions.
 */
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import { careerPaths } from '../../data/sampleData.js'
import { saveAssessment } from '../../services/supabaseData.js'
import PublicNav from '../../components/layout/PublicNav.jsx'
import { analyzeAssessment } from '../../services/apiClient.js'

const questions = [
  ['interest', 'Which work sounds most energizing?', ['Building websites', 'Finding patterns in data', 'Solving cloud/system issues']],
  ['strength', 'What is your current strongest habit?', ['Visual detail', 'Logical analysis', 'Patient troubleshooting']],
  ['subject', 'Which subject do you prefer?', ['Computer Science', 'Mathematics', 'Physics']],
  ['style', 'How do you like working?', ['Creating visible products', 'Comparing numbers', 'Fixing technical problems']],
]

// Renders the assessment and returns ranked career matches.
function Assessment() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Saves one answer and returns the next answer state.
  function setAnswer(key, value) {
    setAnswers((current) => ({ ...current, [key]: value }))
  }

  // Stores assessment results locally and returns the results route.
  async function finishAssessment() {
    setLoading(true)
    setError('')
    let results = careerPaths
    try {
      const data = await analyzeAssessment({ answers })
      results = data.results?.length ? data.results : careerPaths
    } catch (apiError) {
      setError(apiError.message)
    }
    localStorage.setItem('careerspark_assessment', JSON.stringify({ answers, results }))
    try {
      await saveAssessment(answers, results)
    } catch (error) {
      localStorage.setItem('careerspark_assessment_error', error.message)
    } finally {
      setLoading(false)
    }
    navigate('/onboarding/results')
  }

  return (
    <main className="min-h-screen bg-page-warm text-ink">
      <PublicNav />
      <section className="mx-auto max-w-[920px] rounded-lg border border-hairline bg-canvas p-xl">
        <p className="inline-flex rounded-sm border border-hairline px-sm py-xs text-xs font-medium uppercase tracking-[0.04em] text-body">Career assessment</p>
        <h1 className="mt-lg max-w-3xl font-display text-5xl font-semibold leading-[1.05]">Map your strongest starting point.</h1>
        <p className="mt-base max-w-2xl text-sm leading-6 text-body">Choose the answers that feel most true right now. You can retake this later from the dashboard.</p>
        <div className="mt-xl grid gap-lg">
          {questions.map(([key, prompt, options]) => (
            <article className="rounded-lg border border-hairline bg-white p-lg" key={key}>
              <h2 className="font-display text-lg font-semibold">{prompt}</h2>
              <div className="mt-base grid gap-sm md:grid-cols-3">
                {options.map((option) => (
                  <button className={`rounded-md border px-base py-sm text-left text-sm ${answers[key] === option ? 'border-primary bg-primary-tint text-primary' : 'border-hairline text-body hover:bg-surface-soft'}`} key={option} onClick={() => setAnswer(key, option)} type="button">
                    {option}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-xl flex justify-end">
          <Button disabled={Object.keys(answers).length < questions.length || loading} onClick={finishAssessment}>
            {loading ? 'Analyzing...' : 'See results'}
          </Button>
        </div>
        {error ? <p className="mt-base rounded-sm bg-red-50 p-sm text-sm text-error">{error}</p> : null}
      </section>
    </main>
  )
}

export default Assessment
