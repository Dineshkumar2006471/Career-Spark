/*
 * AIChatWidget provides the floating dashboard assistant powered by Gemini AI.
 * It exists as a persistent shortcut with profile, roadmap, and skill context.
 */
import { Bot, ChevronDown, MessageCircle, Send, X, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { askChatbot } from '../../services/apiClient.js'
import { loadProfile, loadRoadmap, loadSkillProgress } from '../../services/supabaseData.js'

// Renders the chat widget and returns a fixed launcher or chat panel.
function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! I am your AI career coach powered by Gemini. Ask me about your roadmap, skills, or resume.' }])
  const [loading, setLoading] = useState(false)
  const [studentContext, setStudentContext] = useState('CareerSpark dashboard')
  const messagesEndRef = useRef(null)

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open) {
      scrollToBottom()
    }
  }, [messages, open, loading])

  // Sends the current user question to the backend and returns no value.
  async function handleSend() {
    if (!message.trim()) return
    const userMessage = { role: 'user', content: message.trim(), timestamp: new Date() }
    setMessages((current) => [...current, userMessage])
    setMessage('')
    setLoading(true)
    try {
      const response = await askChatbot({ message: userMessage.content, context: studentContext })
      setMessages((current) => [...current, { role: 'assistant', content: response.answer, timestamp: new Date() }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error.message, timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        aria-label="Open AI assistant"
        className="fixed bottom-20 right-lg z-50 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 lg:bottom-lg group"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
      </button>
    )
  }

  return (
    <section className="fixed inset-0 z-50 flex flex-col bg-canvas shadow-[0_8px_30px_rgb(0,0,0,0.12)] lg:bottom-lg lg:left-auto lg:right-lg lg:top-auto lg:h-[600px] lg:w-[400px] lg:rounded-2xl lg:border lg:border-hairline overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between bg-gradient-to-r from-primary to-blue-500 p-base text-white">
        <div className="flex items-center gap-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-display text-base font-bold">AI Career Coach</h2>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              Powered by Gemini
            </p>
          </div>
        </div>
        <button aria-label="Close AI assistant" className="rounded-full p-2 text-white hover:bg-white/20 transition-colors" onClick={() => setOpen(false)} type="button">
          <ChevronDown size={20} />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-base space-y-lg bg-surface-soft/30">
        {messages.map((item, index) => {
          const isUser = item.role === 'user'
          return (
            <div key={index} className={`flex gap-sm ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isUser ? 'bg-ink text-white' : 'bg-primary/10 text-primary'}`}>
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`max-w-[75%] rounded-2xl p-sm text-sm leading-relaxed ${isUser ? 'rounded-tr-sm bg-primary text-white shadow-sm' : 'rounded-tl-sm bg-white border border-hairline text-ink shadow-sm'}`}>
                {item.content}
                {item.timestamp && (
                  <p className={`mt-1 text-[10px] ${isUser ? 'text-primary-tint/70 text-right' : 'text-muted'}`}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
        {loading && (
          <div className="flex gap-sm">
             <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Bot size={14} /></div>
             <div className="rounded-2xl rounded-tl-sm bg-white border border-hairline p-sm shadow-sm flex items-center gap-1">
               <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-base bg-white border-t border-hairline">
        <div className="flex items-end gap-2 bg-surface-strong rounded-xl p-1.5 border border-transparent focus-within:border-primary/30 transition-colors">
          <textarea
            className="min-h-[44px] max-h-[120px] w-full resize-none bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-muted"
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask about your roadmap..."
            value={message}
            rows={1}
          />
          <button 
            aria-label="Send message" 
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-all ${message.trim() ? 'bg-primary text-white shadow-sm hover:bg-primary-hover' : 'bg-surface-soft text-muted'}`}
            disabled={!message.trim() || loading}
            onClick={handleSend} 
            type="button"
          >
            <Send size={16} className={message.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default AIChatWidget
