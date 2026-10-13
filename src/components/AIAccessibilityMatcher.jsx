import { useState, useId } from "react"
import { FaWheelchair, FaAssistiveListeningSystems, FaSignLanguage, FaCheckCircle, FaShieldAlt } from "react-icons/fa"

const ACCESSIBILITY_OPTIONS = [
  { id: "wheelchair", label: "Wheelchair & Step-Free Access", icon: FaWheelchair },
  { id: "audioAssist", label: "Assistive Listening Loop", icon: FaAssistiveListeningSystems },
  { id: "signLanguage", label: "Sign Language (ISL/ASL)", icon: FaSignLanguage },
  { id: "quietZone", label: "Sensory Friendly / Quiet Zone", icon: FaShieldAlt },
  { id: "parking", label: "Accessible Parking & Drop-Off", icon: FaCheckCircle }
]

const AIAccessibilityMatcher = ({ event }) => {
  const [selectedNeeds, setSelectedNeeds] = useState(["wheelchair"])
  const [isOpen, setIsOpen] = useState(false)
  const assistNoteId = useId()

  const venueAccessibility = event?.accessibility || {
    wheelchair: true,
    audioAssist: true,
    signLanguage: event?.category === "tech" || event?.category === "workshop",
    quietZone: true,
    parking: true,
    notes: "Venue has dedicated ramp access, ground-level entry, and accessible restroom facilities."
  }

  const toggleNeed = (id) => {
    setSelectedNeeds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Calculate compatibility percentage
  const matchedCount = selectedNeeds.filter((need) => venueAccessibility[need]).length
  const compatibilityScore = selectedNeeds.length > 0
    ? Math.round((matchedCount / selectedNeeds.length) * 100)
    : 100

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center font-bold text-lg">
            ♿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-text-primary">AI Accessibility Matching</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                EventAI Verified
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Personalized compatibility based on your accessibility preferences
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={`text-xl font-black ${compatibilityScore >= 80 ? "text-success" : compatibilityScore >= 50 ? "text-warning" : "text-danger"}`}>
              {compatibilityScore}%
            </span>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Match Score</p>
          </div>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-surface-hover hover:border-accent text-text-primary transition-all cursor-pointer"
          >
            {isOpen ? "Hide Options" : "Customize Needs"}
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="mt-4 flex flex-wrap gap-2">
        {ACCESSIBILITY_OPTIONS.map((opt) => {
          const supported = venueAccessibility[opt.id]
          const isSelected = selectedNeeds.includes(opt.id)
          const Icon = opt.icon

          return (
            <span
              key={opt.id}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all ${
                isSelected
                  ? supported
                    ? "bg-success/10 border-success/30 text-success font-medium"
                    : "bg-danger/10 border-danger/30 text-danger font-medium"
                  : supported
                  ? "bg-surface-hover border-border text-text-secondary"
                  : "bg-surface-hover border-border text-text-muted line-through opacity-60"
              }`}
            >
              <Icon className="text-xs" />
              <span>{opt.label}</span>
              {isSelected && (
                <span>{supported ? "✓" : "✗"}</span>
              )}
            </span>
          )
        })}
      </div>

      {/* Expandable Options Drawer */}
      {isOpen && (
        <div className="mt-5 pt-4 border-t border-border space-y-4 animate-in fade-in">
          <p className="text-xs font-semibold text-text-secondary">
            Select your specific accessibility requirements to recompute match:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ACCESSIBILITY_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isChecked = selectedNeeds.includes(opt.id)
              const isSupported = venueAccessibility[opt.id]

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleNeed(opt.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isChecked
                      ? "border-accent bg-accent-soft/40"
                      : "border-border bg-surface-hover hover:border-border-hover"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`text-sm ${isChecked ? "text-accent" : "text-text-muted"}`} />
                    <span className="text-xs font-medium text-text-primary">{opt.label}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    isSupported ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                  }`}>
                    {isSupported ? "Supported" : "On Request"}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Venue Notes */}
          {venueAccessibility.notes && (
            <div className="p-3.5 rounded-xl bg-surface-hover border border-border text-xs text-text-secondary flex items-start gap-2.5">
              <span className="text-accent text-sm mt-0.5">ℹ️</span>
              <div>
                <strong className="text-text-primary block mb-0.5">Venue Accessibility Details:</strong>
                <span>{venueAccessibility.notes}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 text-xs text-text-muted">
            <span>Need personalized wheelchair assistance or guide escort?</span>
            <label htmlFor={assistNoteId} className="text-accent font-semibold hover:underline cursor-pointer">
              Add note during checkout &rarr;
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAccessibilityMatcher
