/*
 * ChoosePath lets the student select one career path as the dashboard context.
 * It exists to personalize roadmap, courses, internships, and chatbot answers.
 */
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import { careerPaths } from '../../data/sampleData.js'
import { useState } from 'react'
import { roadmapPhases } from '../../data/sampleData.js'
import { saveRoadmapChoice, saveSkillProgress, loadProfile } from '../../services/supabaseData.js'
import { generateRoadmap } from '../../services/apiClient.js'
import { skills } from '../../data/sampleData.js'
import PublicNav from '../../components/layout/PublicNav.jsx'

// Renders path selection and returns the dashboard route after storing the path.
function ChoosePath() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(careerPaths[0].id)

  const [isGenerating, setIsGenerating] = useState(false)

  // Stores the chosen path and returns to dashboard.
  async function saveChoice() {
    setIsGenerating(true)
    const path = careerPaths.find((item) => item.id === selected)
    localStorage.setItem('careerspark_path', JSON.stringify(path))
    try {
      const profile = await loadProfile()
      const payload = {
        career_path: path.title,
        current_skills: profile?.skills || [],
        goal_note: profile?.goal_note || ''
      }
      
      let phasesToSave = roadmapPhases
      try {
        const aiResponse = await generateRoadmap(payload)
        if (aiResponse && aiResponse.phases) {
          phasesToSave = aiResponse.phases
        }
      } catch (aiError) {
        console.error("AI Roadmap generation failed, falling back to default:", aiError)
      }

      await saveRoadmapChoice(path, phasesToSave)
      await saveSkillProgress(skills)
    } catch (error) {
      localStorage.setItem('careerspark_save_choice_error', error.message)
    } finally {
      setIsGenerating(false)
      navigate('/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-page-warm text-ink">
      <PublicNav />
      <section className="mx-auto max-w-[920px] rounded-lg border border-hairline bg-canvas p-xl">
        <p className="inline-flex rounded-sm border border-hairline px-sm py-xs text-xs font-medium uppercase tracking-[0.04em] text-body">Primary path</p>
        <h1 className="mt-lg max-w-3xl font-display text-5xl font-semibold leading-[1.05]">Choose the path your dashboard should organize around.</h1>
        <div className="mt-xl grid gap-base">
          {careerPaths.map((path) => (
            <button className={`rounded-lg border p-lg text-left ${selected === path.id ? 'border-primary bg-primary-tint' : 'border-hairline hover:bg-surface-soft'}`} key={path.id} onClick={() => setSelected(path.id)} type="button">
              <p className="font-display text-lg font-semibold text-ink">{path.title}</p>
              <p className="mt-xs text-sm text-body">{path.summary}</p>
            </button>
          ))}
        </div>
        <div className="mt-xl flex justify-end">
          <Button onClick={saveChoice} disabled={isGenerating}>
            {isGenerating ? 'Generating Your Custom Roadmap...' : 'Go to dashboard'}
          </Button>
        </div>
      </section>
    </main>
  )
}

export default ChoosePath
