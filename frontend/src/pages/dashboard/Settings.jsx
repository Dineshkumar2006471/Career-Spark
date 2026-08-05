import { useState } from 'react'
import { 
  User, Mail, Phone, Image as ImageIcon,
  Briefcase, MapPin, DollarSign, Target, Code,
  Sparkles, BookOpen, Bell, Shield, Key, Lock, Trash2, Check, Save,
  Smartphone, BarChart, AlertTriangle
} from 'lucide-react'

// Reusable toggle component
function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-hairline/60 last:border-0">
      <div className="pr-4">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <button 
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${checked ? 'bg-primary' : 'bg-surface-soft'}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

// Reusable input component
function InputGroup({ icon: Icon, label, type = "text", placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
          <Icon size={16} />
        </div>
        <input
          type={type}
          className="block w-full rounded-xl border border-hairline bg-surface py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

// Reusable section card component
function SectionCard({ icon: Icon, title, description, children, iconBg = "bg-primary/10", iconColor = "text-primary" }) {
  return (
    <div className="rounded-3xl border border-hairline bg-canvas p-4 sm:p-xl shadow-sm space-y-5">
      <div className="flex items-center gap-3 border-b border-hairline pb-4">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-ink">{title}</h3>
          {description && <p className="text-xs sm:text-sm text-muted">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

function Settings() {
  const [saved, setSaved] = useState(false)

  // 1. Profile Settings State
  const [name, setName] = useState('Jake')
  const [email, setEmail] = useState('jake@example.com')
  const [mobile, setMobile] = useState('+91 9876543210')

  // 2. Career Preferences State
  const [domain, setDomain] = useState('Software Engineering')
  const [location, setLocation] = useState('Bangalore, India')
  const [salary, setSalary] = useState('10 - 15 LPA')
  const [jobType, setJobType] = useState('Full-Time / Remote')
  const [skills, setSkills] = useState('React, Node.js, Python, AWS')

  // 3. AI Recommendation Settings State
  const [aiSuggestions, setAiSuggestions] = useState(true)
  const [personalizedLearning, setPersonalizedLearning] = useState(true)
  const [placementAlerts, setPlacementAlerts] = useState(true)
  const [internshipNotifs, setInternshipNotifs] = useState(false)

  // 4. Notification Settings State
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)

  // 5. Privacy & Security State
  const [twoFactor, setTwoFactor] = useState(false)
  const [resumeVisibility, setResumeVisibility] = useState(true)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    // In a real app, dispatch to API here
  }

  return (
    <div className="max-w-5xl pb-20 animate-[fadeIn_0.3s_ease-out]">
      <div className="border-b border-hairline pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Dashboard Settings</h1>
          <p className="mt-1 text-sm text-body">Manage your profile, career preferences, and AI platform settings.</p>
        </div>
        
        {/* Sticky-ish Save Button for Mobile / Top Right for Desktop */}
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-display font-semibold text-white shadow-md hover:bg-primary/90 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Wider on Desktop) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Profile Settings */}
          <SectionCard 
            icon={User} 
            title="Profile Settings" 
            description="Your personal information and identity."
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          >
            <div className="flex flex-col sm:flex-row gap-6 mb-2">
              <div className="flex flex-col items-center gap-2">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {name.charAt(0)}
                </div>
                <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  <ImageIcon size={14}/> Change Picture
                </button>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputGroup icon={User} label="Full Name" value={name} onChange={setName} />
                </div>
                <InputGroup icon={Mail} label="Email Address" type="email" value={email} onChange={setEmail} />
                <InputGroup icon={Phone} label="Mobile Number" value={mobile} onChange={setMobile} />
              </div>
            </div>
          </SectionCard>

          {/* 2. Career Preferences */}
          <SectionCard 
            icon={Briefcase} 
            title="Career Preferences" 
            description="Help our AI match you with the best opportunities."
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup icon={Target} label="Preferred Domain / Target Role" value={domain} onChange={setDomain} />
              <InputGroup icon={MapPin} label="Preferred Location" value={location} onChange={setLocation} />
              <InputGroup icon={DollarSign} label="Salary Expectation (LPA)" value={salary} onChange={setSalary} />
              <InputGroup icon={Briefcase} label="Job Type" value={jobType} onChange={setJobType} />
              <div className="sm:col-span-2">
                <InputGroup icon={Code} label="Your Core Skills (Comma Separated)" value={skills} onChange={setSkills} />
              </div>
            </div>
          </SectionCard>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* 3. AI Recommendation Settings */}
          <SectionCard 
            icon={Sparkles} 
            title="AI Recommendation Settings" 
            description="Control how Gemini AI guides your career."
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          >
            <Toggle label="Enable AI Suggestions" description="Get real-time AI advice on your dashboard." checked={aiSuggestions} onChange={setAiSuggestions} />
            <Toggle label="Personalized Learning" description="AI will curate courses based on your skill gaps." checked={personalizedLearning} onChange={setPersonalizedLearning} />
            <Toggle label="Placement Alerts" description="AI will flag high-match job openings automatically." checked={placementAlerts} onChange={setPlacementAlerts} />
            <Toggle label="Internship Notifications" description="Get notified about early-career internships." checked={internshipNotifs} onChange={setInternshipNotifs} />
          </SectionCard>

          {/* 4. Notification Settings */}
          <SectionCard 
            icon={Bell} 
            title="Notification Settings" 
            description="Manage how we contact you."
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          >
            <Toggle label="Email Alerts" description="Receive important updates via email." checked={emailAlerts} onChange={setEmailAlerts} />
            <Toggle label="SMS Alerts" description="Get text messages for critical interview updates." checked={smsAlerts} onChange={setSmsAlerts} />
            <Toggle label="Push Notifications" description="Browser notifications while using the app." checked={pushNotifs} onChange={setPushNotifs} />
            <Toggle label="Weekly Career Report" description="A weekly digest of your skill growth and job matches." checked={weeklyReport} onChange={setWeeklyReport} />
          </SectionCard>

          {/* 5. Privacy & Security */}
          <SectionCard 
            icon={Shield} 
            title="Privacy & Security" 
            description="Keep your account safe and manage data."
            iconBg="bg-rose-100"
            iconColor="text-rose-600"
          >
            <Toggle label="Two-Factor Authentication" description="Require a code when logging in." checked={twoFactor} onChange={setTwoFactor} />
            <Toggle label="Resume Visibility" description="Allow verified recruiters to view your ATS resume." checked={resumeVisibility} onChange={setResumeVisibility} />
            
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-surface-soft px-4 py-2 text-sm font-semibold text-ink border border-hairline hover:bg-surface hover:border-muted transition-colors">
                <Key size={16} /> Change Password
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors">
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  )
}

export default Settings
