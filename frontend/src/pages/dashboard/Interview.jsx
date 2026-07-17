/*
 * Interview renders the Web Speech API mock interview simulator.
 * It exists to give students low-pressure behavioral interview practice.
 */
import { Bot, CheckCircle2, ChevronRight, Mic, MicOff, Square, Trophy, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getInterviewFeedback } from '../../services/apiClient.js'
import { getTargetRole } from '../../services/careerAnalysis.js'
import { loadProfile, saveInterviewSession } from '../../services/supabaseData.js'

function Interview() {
  const [targetRole, setTargetRole] = useState('Frontend Developer')
  const [userProfile, setUserProfile] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState('Tell me about a time you had to learn a new tool for a project. How did you approach it?')
  const [nextQuestionText, setNextQuestionText] = useState('')
  const [questionCount, setQuestionCount] = useState(1)
  const [chatHistory, setChatHistory] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [interviewComplete, setInterviewComplete] = useState(false)
  
  const recognitionRef = useRef(null)

  useEffect(() => {
    loadProfile().then(p => {
      const role = getTargetRole(p) || 'Frontend Developer'
      setUserProfile(p)
      setTargetRole(role)
      setCurrentQuestion(`Tell me about a time you had to learn a new tool for a project as a ${role}. How did you approach it?`)
    }).catch(() => {
      // Keep defaults
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
      const res = await getInterviewFeedback({ 
        prompt: currentQuestion, 
        transcript, 
        target_role: targetRole,
        history: chatHistory,
        profile_skills: userProfile?.skills || [],
        experience: userProfile?.experience || [],
        projects: userProfile?.projects || []
      })
      
      setFeedback(res.feedback)
      
      if (res.next_question) {
        setNextQuestionText(res.next_question)
      }

      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: transcript },
        { role: 'model', content: JSON.stringify(res.feedback) }
      ])
      
      try {
        await saveInterviewSession(currentQuestion, transcript, JSON.stringify(res.feedback))
      } catch (dbError) {
        console.warn('Could not save session to db:', dbError)
      }
      
    } catch (error) {
      setFeedback(`Error analyzing response: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const nextQuestion = () => {
    if (questionCount >= 5) {
      setInterviewComplete(true)
      return
    }
    
    if (nextQuestionText) {
      setCurrentQuestion(nextQuestionText)
      setNextQuestionText('')
      setTranscript('')
      setFeedback('')
      setQuestionCount(prev => prev + 1)
      setIsRecording(false)
      recognitionRef.current?.stop()
    }
  }

  const isComplete = interviewComplete || (questionCount >= 5 && feedback)

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
          <p className="mt-sm max-w-2xl text-sm leading-relaxed text-body">Practice answering behavioral questions out loud. The Gemini AI coach will transcribe your speech and generate dynamic follow-up questions.</p>
        </div>
      </section>

      {currentQuestion && (
        <div className="grid gap-xl grid-cols-1 lg:grid-cols-12">
          
          {/* Main Stage - Left Side (8 cols) */}
          <div className="lg:col-span-8 space-y-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted mb-2">
              Question {questionCount} of 5
            </div>
            
            <article className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-xl shadow-sm">
              <h3 className="font-display text-2xl font-bold text-ink leading-tight">"{currentQuestion}"</h3>
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
                  <div aria-live="polite" className="min-h-[100px] rounded-xl bg-surface-soft p-4 border border-hairline text-sm leading-relaxed text-ink shadow-inner">
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

            {/* Ideal Answer Bento Card */}
            {feedback && feedback.example_answer && (
              <article className="rounded-2xl border border-primary/30 bg-primary/5 p-lg shadow-sm">
                <div className="flex items-center gap-sm mb-4">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary"><Trophy size={16} /></div>
                  <h3 className="font-display font-bold text-ink">Ideal STAR Response</h3>
                </div>
                <div className="rounded-xl bg-white p-base shadow-inner border border-hairline text-sm leading-relaxed text-ink italic">
                  "{feedback.example_answer}"
                </div>
              </article>
            )}
          </div>

          {/* Feedback Sidebar - Right Side (4 cols) */}
          <div className="lg:col-span-4 space-y-lg">
            <article className={`rounded-2xl border p-lg transition-all h-full flex flex-col ${feedback ? 'border-primary/30 bg-white shadow-md' : 'border-hairline bg-canvas opacity-50'}`}>
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Bot size={20} /></div>
                  <h3 className="font-display text-xl font-bold">Coach Feedback</h3>
                </div>
                {feedback && (
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${feedback.score >= 7 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    Score: {feedback.score}/10
                  </div>
                )}
              </div>
              
              {feedback ? (
                <div className="space-y-6 flex-grow">
                  {/* Pros Section */}
                  {feedback.pros && feedback.pros.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-green-700 flex items-center gap-2">
                        <CheckCircle2 size={16} /> What you did well
                      </h4>
                      <ul className="space-y-2">
                        {feedback.pros.map((pro, idx) => (
                          <li key={idx} className="text-sm text-ink bg-green-50 rounded-lg p-3 border border-green-100 leading-snug">
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cons Section */}
                  {feedback.cons && feedback.cons.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-red-700 flex items-center gap-2">
                        <Settings size={16} /> Areas to improve
                      </h4>
                      <ul className="space-y-2">
                        {feedback.cons.map((con, idx) => (
                          <li key={idx} className="text-sm text-ink bg-red-50 rounded-lg p-3 border border-red-100 leading-snug">
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-6 border-t border-hairline mt-auto">
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
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted flex-grow">
                  <Bot size={32} className="mb-4 opacity-20" />
                  <p className="text-sm">Speak your answer and click Analyze to get your Bento Grid scorecard.</p>
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
