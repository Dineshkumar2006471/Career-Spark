/*
 * Settings allows students to configure their dashboard preferences,
 * AI notification frequencies, and profile privacy options.
 */
import { useState } from 'react'
import { Settings as SettingsIcon, Bell, Shield, Moon, Globe, Check, Save } from 'lucide-react'

function Settings() {
  const [notifications, setNotifications] = useState(true)
  const [aiAlerts, setAiAlerts] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-xl max-w-4xl pb-12">
      <div className="border-b border-hairline pb-6">
        <h1 className="font-display text-3xl font-bold text-ink">Account & Platform Settings</h1>
        <p className="mt-1 text-sm text-body">Manage your AI recommendations, notifications, and privacy preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Notifications Card */}
        <div className="rounded-3xl border border-hairline bg-canvas p-xl shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-hairline pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink">Notification Preferences</h3>
              <p className="text-xs text-muted">Control how CareerSpark contacts you about placement drives.</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-ink">Placement Drive Alerts</p>
              <p className="text-xs text-muted">Get notified instantly when new campus drives match your profile.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-5 w-5 rounded border-hairline text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-hairline/60">
            <div>
              <p className="text-sm font-semibold text-ink">Real-Time AI Skill Gaps</p>
              <p className="text-xs text-muted">Receive weekly Gemini insights on emerging industry skills.</p>
            </div>
            <input
              type="checkbox"
              checked={aiAlerts}
              onChange={(e) => setAiAlerts(e.target.checked)}
              className="h-5 w-5 rounded border-hairline text-primary focus:ring-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Privacy Card */}
        <div className="rounded-3xl border border-hairline bg-canvas p-xl shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-hairline pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-700">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink">Privacy & Profile Sharing</h3>
              <p className="text-xs text-muted">Manage who can view your ATS resume score and verified badges.</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-ink">Make Profile Visible to Recruiter AI</p>
              <p className="text-xs text-muted">Allow partner tech companies to match your profile for off-campus drives.</p>
            </div>
            <input
              type="checkbox"
              checked={publicProfile}
              onChange={(e) => setPublicProfile(e.target.checked)}
              className="h-5 w-5 rounded border-hairline text-primary focus:ring-primary cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4">
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Check size={16} /> Preferences Saved Successfully!
          </span>
        )}
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-display font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  )
}

export default Settings
