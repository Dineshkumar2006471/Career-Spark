/*
 * AIChatWidget provides the floating dashboard assistant.
 * It exists as a persistent shortcut with profile, roadmap, and skill context.
 */
import { MessageCircle, Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { askChatbot } from '../../services/apiClient.js'
import { loadProfile, loadRoadmap, loadSkillProgress } from '../../services/supabaseData.js'

// Renders the chat widget and returns a fixed launcher or chat panel.
function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Ask me about your roadmap, skills, internships, or resume.' }])
  const [loading, setLoading] = useState(false)
  const [studentContext, setStudentContext] = useState('CareerSpark dashboard')

  useEffect(() => {
    Promise.all([loadProfile(), loadRoadmap(), loadSkillProgress()])
      .then(([profile, roadmap, skills]) => {
        const skillSummary = skills.map((skill) => `${skill.skill_name}: ${skill.current_level}/${skill.target_level}`).join(', ')
        setStudentContext(
          [
            `Goal note: ${profile?.goal_note || 'not set'}`,
            `Email: ${profile?.email || 'not set'}`,
            `Location: ${profile?.city || profile?.state || profile?.location_label || 'not set'}`,
            `Current course: ${profile?.current_course || 'not set'}`,
            `Profile skills: ${(profile?.skills || []).join(', ') || 'not set'}`,
            `Projects: ${(profile?.projects || []).join(', ') || 'not set'}`,
            `Applications: ${(profile?.applications || []).join(', ') || 'not set'}`,
            `Achievements: ${(profile?.achievements || []).join(', ') || 'not set'}`,
            `Experience: ${(profile?.experience_items || []).join(', ') || 'not set'}`,
            `Resume feedback: ${JSON.stringify(profile?.resume_feedback || {})}`,
            `Career path: ${roadmap?.career_path || 'not selected'}`,
            `Roadmap phases: ${JSON.stringify(roadmap?.phases || [])}`,
            `Skill gaps: ${skillSummary || 'not tracked yet'}`,
          ].join('\n'),
        )
      })
      .catch(() => setStudentContext('CareerSpark dashboard'))
  }, [])

  // Sends the current user question to the backend and returns no value.
  async function handleSend() {
    if (!message.trim()) return
    const userMessage = { role: 'user', content: message.trim() }
    setMessages((current) => [...current, userMessage])
    setMessage('')
    setLoading(true)
    try {
      const response = await askChatbot({ message: userMessage.content, context: studentContext })
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error.message }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        aria-label="Open AI assistant"
        className="fixed bottom-20 right-lg z-30 grid h-14 w-14 place-items-center rounded-lg bg-primary text-white shadow-float lg:bottom-lg"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MessageCircle aria-hidden="true" />
      </button>
    )
  }

  return (
    <section className="fixed inset-0 z-30 bg-canvas p-lg shadow-float lg:bottom-lg lg:left-auto lg:right-lg lg:top-auto lg:h-[520px] lg:w-[380px] lg:rounded-lg lg:border lg:border-hairline">
      <header className="flex items-center justify-between border-b border-hairline pb-base">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">AI Career Assistant</h2>
          <p className="text-sm text-body">Roadmap-aware answers</p>
        </div>
        <button aria-label="Close AI assistant" className="rounded-sm p-xs text-body hover:bg-surface-soft" onClick={() => setOpen(false)} type="button">
          <X aria-hidden="true" />
        </button>
      </header>
      <div className="flex h-[calc(100%-104px)] flex-col gap-sm overflow-y-auto py-base">
        {messages.map((item, index) => (
          <p className={`rounded-lg p-sm text-sm leading-6 ${item.role === 'user' ? 'ml-xl bg-primary text-white' : 'mr-xl bg-surface-soft text-body'}`} key={`${item.role}-${index}`}>
            {item.content}
          </p>
        ))}
        {loading ? <p className="mr-xl rounded-lg bg-surface-soft p-sm text-sm text-body">Thinking through your profile...</p> : null}
      </div>
      <div className="flex gap-sm border-t border-hairline pt-base">
        <input
          className="min-w-0 flex-1 rounded-sm bg-surface-strong px-base py-sm text-sm text-ink"
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSend()
          }}
          placeholder="Ask a career question"
          value={message}
        />
        <button aria-label="Send message" className="grid h-11 w-11 place-items-center rounded-md bg-primary text-white" onClick={handleSend} type="button">
          <Send aria-hidden="true" size={18} />
        </button>
      </div>
    </section>
  )
}

export default AIChatWidget
