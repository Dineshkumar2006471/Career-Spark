/*
 * Interview renders the Web Speech API mock interview simulator.
 * It exists to help students practice clear answers before applications.
 */
import { Mic } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getInterviewFeedback } from '../../services/apiClient.js'
import { loadProfile, loadRoadmap, saveInterviewSession } from '../../services/supabaseData.js'
import { getTargetRole } from '../../services/careerAnalysis.js'

// Renders mock interview controls and returns transcript feedback.
function Interview() {
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [feedback, setFeedback] = useState('Answer the prompt, then request feedback.')
  const targetRole = getTargetRole(profile, roadmap)
  const prompt = `Tell me about one project, skill, or experience that proves you are ready for ${targetRole}.`

  useEffect(() => {
    loadProfile().then(setProfile).catch(() => {})
    loadRoadmap().then(setRoadmap).catch(() => {})
    return () => recognitionRef.current?.stop()
  }, [])

  // Starts browser speech recognition and returns transcript text.
  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setFeedback('Speech recognition is not supported in this browser. Type your answer instead.')
      return
    }
    recognitionRef.current?.stop()
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onstart = () => {
      setListening(true)
      finalTranscriptRef.current = transcript ? `${transcript.trim()} ` : ''
      setFeedback('Listening. Speak clearly; interim words will appear in the answer box.')
    }
    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0].transcript
        if (event.results[index].isFinal) finalText += `${text} `
        else interimText += text
      }
      if (finalText) finalTranscriptRef.current += finalText
      setTranscript(`${finalTranscriptRef.current}${interimText}`.trim())
    }
    recognition.onerror = (event) => {
      setFeedback(`Speech input error: ${event.error}. You can still type your answer.`)
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  // Sends the transcript to the backend and returns coaching feedback.
  async function requestFeedback() {
    try {
      const data = await getInterviewFeedback({ prompt, transcript })
      setFeedback(data.feedback)
      await saveInterviewSession(prompt, transcript, data.feedback)
    } catch (error) {
      setFeedback(error.message)
    }
  }

  return (
    <div className="space-y-lg">
      <section className="rounded-lg border border-hairline bg-canvas p-lg">
        <p className="text-xs font-medium uppercase tracking-[0.04em] text-primary">Mock interview</p>
        <h2 className="mt-sm font-display text-3xl font-semibold">{prompt}</h2>
        <textarea className="mt-lg min-h-40 w-full rounded-sm bg-surface-strong p-base text-sm text-ink" onChange={(event) => setTranscript(event.target.value)} value={transcript} />
        <div className="mt-base flex flex-wrap gap-sm">
          <button className="inline-flex h-11 items-center gap-sm rounded-md border border-hairline px-lg text-sm font-medium" onClick={startListening} type="button"><Mic size={18} /> Speak answer</button>
          <button className="h-11 rounded-md border border-hairline px-lg text-sm font-medium text-ink hover:bg-surface-soft" disabled={!listening} onClick={stopListening} type="button">{listening ? 'Stop listening' : 'Not recording'}</button>
          <button className="h-11 rounded-md bg-ink px-lg text-sm font-medium text-white hover:bg-primary" onClick={requestFeedback} type="button">Get feedback</button>
        </div>
      </section>
      <article className="rounded-lg border border-hairline bg-canvas p-lg text-sm leading-6 text-body">{feedback}</article>
    </div>
  )
}

export default Interview
