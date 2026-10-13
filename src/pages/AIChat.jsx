import { useEffect, useRef, useState } from "react"
import { FaRobot, FaUser, FaCopy, FaCheck, FaPaperPlane, FaWandMagicSparkles } from "react-icons/fa6"
import { askEventAI } from "../services/aiAssistant"
import { useToast } from "../context/ToastContext"

const SUGGESTIONS = [
  "Write a short description for a music festival",
  "Suggest a theme for a tech conference",
  "Give me tips to increase ticket sales",
  "Sponsorship proposal outline",
  "Venue logistics checklist"
]

const FormattedContent = ({ content }) => {
  // Simple clean formatting for markdown bold, lists, and headings
  const lines = content.split("\n")

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1.5" />

        // Bullet point
        if (line.trim().startsWith("• ") || line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          const bulletText = line.trim().replace(/^[-*•]\s+/, "")
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-accent text-xs mt-1">•</span>
              <span>{renderBold(bulletText)}</span>
            </div>
          )
        }

        // Heading or bold highlight
        if (line.startsWith("#") || (line.startsWith("**") && line.endsWith("**"))) {
          const headingText = line.replace(/^[#*]+\s*/, "").replace(/[*#]+$/, "")
          return (
            <h4 key={idx} className="font-bold text-base text-white pt-1">
              {headingText}
            </h4>
          )
        }

        return <p key={idx}>{renderBold(line)}</p>
      })}
    </div>
  )
}

const renderBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your EventAI assistant. Ask me anything about planning, promoting, describing, or pricing your event."
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const { showToast } = useToast()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const nextMessages = [...messages, { role: "user", content: trimmed }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await askEventAI(nextMessages)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply, provider: response.provider }
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm ready to help with event planning. Please tell me more about your event concept or questions!"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    showToast("Copied to clipboard!")
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <span className="p-2.5 bg-accent/20 rounded-2xl text-accent">
              <FaRobot className="text-2xl" />
            </span>
            EventAI Assistant
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Intelligent copilot for event promotion, themes, copy, and ticketing strategy
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AI Engine Ready
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-surface border border-border rounded-2xl p-4 md:p-6 overflow-y-auto space-y-4 min-h-[450px] max-h-[65vh] shadow-elevated">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <FaWandMagicSparkles className="text-xs" />
              </div>
            )}

            <div
              className={`relative group max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm ${
                m.role === "user"
                  ? "bg-accent text-white rounded-tr-xs"
                  : "bg-surface-hover border border-border/80 text-text-primary rounded-tl-xs"
              }`}
            >
              {m.role === "assistant" ? (
                <div>
                  <FormattedContent content={m.content} />
                  <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-text-muted">
                    <span>EventAI Copilot</span>
                    <button
                      onClick={() => handleCopy(m.content, i)}
                      className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity flex items-center gap-1 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedIndex === i ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                      <span>{copiedIndex === i ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="font-medium text-sm">{m.content}</div>
              )}
            </div>

            {m.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <FaUser className="text-xs" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-1">
              <FaWandMagicSparkles className="text-xs animate-spin" />
            </div>
            <div className="bg-surface-hover border border-border px-5 py-3.5 rounded-2xl text-text-secondary text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 text-xs text-text-muted">Generating event insights...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Suggestion Pills */}
      <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="text-xs bg-surface border border-border hover:border-accent hover:text-accent disabled:opacity-50 px-3.5 py-2 rounded-xl text-text-secondary shrink-0 transition-colors cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask EventAI (e.g. Write a festival description, ticket promotion ideas...)"
          className="flex-1 px-4 py-3.5 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <FaPaperPlane className="text-sm" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  )
}

export default AIChat