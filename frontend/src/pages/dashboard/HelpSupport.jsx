/*
 * HelpSupport provides students with direct assistance, FAQs,
 * and mentor/support contact options for their career preparation journey.
 */
import { HelpCircle, MessageSquare, Mail, FileQuestion, BookOpen, ExternalLink, Sparkles } from 'lucide-react'

function HelpSupport() {
  const faqs = [
    {
      q: "How does Vertex AI calculate my Job Match percentage?",
      a: "Our Gemini 2.5 Flash engine evaluates your profile skills, academic projects, experience items, and ATS resume feedback against real-time industry job descriptions to generate a realistic compatibility score."
    },
    {
      q: "Can I apply for placement drives directly through CareerSpark?",
      a: "Yes! Every recommended job card includes an official 'Apply Now' button that links directly to the hiring company's verified application portal or recruitment search page."
    },
    {
      q: "How often are new placement drives and internships updated?",
      a: "Job recommendations are generated dynamically in real-time. You can click 'Refresh AI Matches' anytime on the Job Recommendations page to fetch the latest opportunities."
    },
    {
      q: "What if my ATS resume score is below 80%?",
      a: "Visit the 'Resume Analyzer' tab in your sidebar to upload your PDF or paste your resume text. Our AI will provide exact keyword suggestions and formatting improvements to boost your score."
    }
  ]

  return (
    <div className="space-y-xl max-w-4xl pb-12">
      <div className="border-b border-hairline pb-6">
        <h1 className="font-display text-3xl font-bold text-ink">Help & Support</h1>
        <p className="mt-1 text-sm text-body">Find answers to common questions or reach out to our career mentorship team.</p>
      </div>

      {/* Quick Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-hairline bg-canvas p-xl shadow-sm flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-ink">AI Career Mentor Chat</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Have an urgent question about an interview or skill roadmap? Chat 24/7 with our AI Assistant using the floating widget in the bottom right.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-hairline bg-canvas p-xl shadow-sm flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Mail size={24} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-ink">Mentor Email Support</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Need manual resume verification or 1-on-1 placement guidance? Email our student success team at <a href="mailto:support@careerspark.ai" className="text-primary font-semibold hover:underline">support@careerspark.ai</a>.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <FileQuestion size={20} className="text-primary" />
          <h2 className="font-display text-xl font-bold text-ink">Frequently Asked Questions</h2>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-hairline bg-canvas p-6 shadow-sm space-y-2">
              <h4 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <span className="text-primary font-mono">Q{idx + 1}.</span> {faq.q}
              </h4>
              <p className="text-xs text-body leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HelpSupport
