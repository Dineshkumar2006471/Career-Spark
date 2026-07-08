/*
 * Interview renders the Web Speech API mock interview simulator.
 * It exists to give students low-pressure behavioral interview practice.
 */
import { Bot, CheckCircle2, ChevronRight, Mic, MicOff, Square, Trophy, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getInterviewFeedback } from '../../services/apiClient.js'
import { getTargetRole } from '../../services/careerAnalysis.js'
import { loadProfile } from '../../services/supabaseData.js'

function Interview() {
  const [targetRole, setTargetRole] = useState('Frontend Developer')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const recognitionRef = useRef(null)

  useEffect(() => {
    loadProfile().then(p => {
      const role = getTargetRole(p) || 'Frontend Developer'
      setTargetRole(role)
      setQuestions([
        `Tell me about a time you had to learn a new tool for a project. How did you approach it?`,
        `Describe a ${role} project you are most proud of. What was your role?`,
        `How do you handle disagreements in a team setting? Give an example.`,
      ])
    }).catch(() => {
      setQuestions([
        "Tell me about a time you learned something difficult.",
        "Describe a project you are proud of.",
        "Why do you want to work in this field?"
      ])
    })
  }, [])

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-IN'

      recognition.onresult = (event) => {
        let currentTranscript = ''
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' '
        }
        setTranscript(currentTranscript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      if (!recognitionRef.current) {
        alert("Your browser doesn't support the Web Speech API. Try Chrome.")
        return
      }
      setTranscript('')
      setFeedback('')
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const submitForFeedback = async () => {
    if (!transcript.trim()) return
    setIsAnalyzing(true)
    try {
      const res = await getInterviewFeedback({ prompt: questions[currentIndex], transcript })
      setFeedback(res.feedback)
    } catch (error) {
      setFeedback(`Error analyzing response: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setTranscript('')
      setFeedback('')
      setIsRecording(false)
      recognitionRef.current?.stop()
    }
  }

  const isComplete = currentIndex === questions.length - 1 && feedback

  return (
    <div className="space-y-xl max-w-5xl mx-auto">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-canvas to-red-500/5 p-xl shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-red-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-sm rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600 mb-4">
            <Mic size={14} /> Mock Interview
          </div>
          <h2 className="font-display text-3xl font-bold">Behavioral Simulator</h2>
          <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body">Practice answering behavioral questions out loud. The Gemini AI coach will transcribe your speech and suggest improvements using the STAR method.</p>
        </div>
      </section>

      {questions.length > 0 && (
        <div className="grid gap-xl lg:grid-cols-[1fr_350px]">
          {/* Main Stage */}
          <div className="space-y-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted mb-2">
              Question {currentIndex + 1} of {questions.length}
            </div>
            
            <article className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-xl shadow-sm">
              <h3 className="font-display text-2xl font-bold text-ink leading-tight">"{questions[currentIndex]}"</h3>
            </article>

            {/* Recording Area */}
            <article className={`rounded-2xl border-2 p-lg transition-all ${isRecording ? 'border-red-400 bg-red-50/50 shadow-md' : 'border-hairline bg-canvas shadow-sm'}`}>
              <div className="flex flex-col items-center justify-center py-xl text-center">
                <button
                  onClick={toggleRecording}
                  disabled={isAnalyzing}
                  className={`grid h-24 w-24 place-items-center rounded-full mb-6 transition-all duration-300 shadow-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-ink text-white hover:scale-105 hover:bg-primary disabled:opacity-50 disabled:hover:scale-100'}`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording ? <Square size={32} className="fill-current" /> : <Mic size={36} />}
                </button>
                
                <p className="font-display font-bold text-lg text-ink">
                  {isRecording ? 'Listening...' : transcript ? 'Recording stopped' : 'Click to start speaking'}
                </p>
                {isRecording && <p className="text-sm text-red-500 mt-2">Speak clearly into your microphone</p>}
              </div>

              {/* Live Transcript Box */}
              {(transcript || isRecording) && (
                <div className="mt-lg border-t border-hairline pt-lg">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Live Transcript</h4>
                  <div className="min-h-[100px] rounded-xl bg-surface-soft p-4 border border-hairline text-sm leading-relaxed text-ink shadow-inner">
                    {transcript || <span className="text-muted italic">Waiting for speech...</span>}
                  </div>
                  
                  {!isRecording && transcript && !feedback && !isAnalyzing && (
                    <div className="mt-6 flex justify-end">
                      <button onClick={submitForFeedback} className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold shadow-md hover:bg-primary-hover hover:shadow-lg transition-all flex items-center gap-2">
                        <Bot size={16} /> Analyze Answer
                      </button>
                    </div>
                  )}
                  
                  {isAnalyzing && (
                    <div className="mt-6 flex justify-end">
                      <div className="h-11 px-6 rounded-xl bg-surface-strong text-ink text-sm font-semibold flex items-center gap-3">
                        <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                        AI Coach is thinking...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          </div>

          {/* Feedback Sidebar */}
          <div className="space-y-lg">
            <article className={`rounded-2xl border p-lg transition-all h-full ${feedback ? 'border-primary/30 bg-primary/5 shadow-md' : 'border-hairline bg-canvas opacity-50'}`}>
              <div className="flex items-center gap-sm mb-lg">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Bot size={20} /></div>
                <h3 className="font-display text-xl font-bold">Coach Feedback</h3>
              </div>
              
              {feedback ? (
                <div className="space-y-6">
                  <div className="rounded-xl bg-white p-base shadow-sm border border-hairline text-sm leading-relaxed text-ink">
                    {feedback}
                  </div>
                  
                  <div className="pt-4 border-t border-primary/20">
                    <button 
                      onClick={nextQuestion}
                      disabled={isComplete}
                      className="w-full h-11 rounded-xl bg-ink text-white text-sm font-semibold shadow-sm hover:bg-surface-strong transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isComplete ? (
                        <><Trophy size={16} /> Interview Complete</>
                      ) : (
                        <>Next Question <ChevronRight size={16} /></>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted">
                  <Bot size={32} className="mb-4 opacity-20" />
                  <p className="text-sm">Speak your answer and click Analyze to get Gemini feedback.</p>
                </div>
              )}
            </article>
          </div>
        </div>
      )}
    </div>
  )
}

export default Interview
