import { useEffect, useRef, useState } from "react"
import { supabase } from "../services/supabase"

const SUGGESTIONS = [
    "Suggest a theme for a tech conference",
    "Write a short description for a music festival",
    "Give me tips to increase ticket sales"
]

const AIChat = () => {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! I'm your EventAI assistant. Ask me anything about planning or promoting your event."
        }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async (text) => {
        const trimmed = text.trim()
        if (!trimmed || loading) return

        const nextMessages = [...messages, { role: "user", content: trimmed }]
        setMessages(nextMessages)
        setInput("")
        setLoading(true)

        try {
            // Calls a Supabase Edge Function named "ai-chat".
            // Create it with `supabase functions new ai-chat` and have it call your
            // AI provider server-side (keeps the API key off the client).
            const { data, error } = await supabase.functions.invoke("ai-chat", {
                body: { messages: nextMessages }
            })

            if (error) throw error

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply }
            ])
        } catch (err) {
            console.error(err)
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "I couldn't reach the AI service just now. Please make sure the 'ai-chat' Supabase Edge Function is deployed, then try again."
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        sendMessage(input)
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col p-10 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">AI Assistant</h1>

            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-y-auto space-y-4 min-h-[400px] max-h-[60vh]">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[75%] px-5 py-3 rounded-2xl ${m.role === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-zinc-800 text-zinc-200"
                                }`}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 text-zinc-400 px-5 py-3 rounded-2xl">
                            Thinking...
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {messages.length === 1 && (
                <div className="flex gap-3 flex-wrap mt-4">
                    {SUGGESTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full text-zinc-300"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3 mt-6">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the AI assistant..."
                    className="flex-1 p-4 rounded-xl bg-zinc-900 border border-zinc-800 outline-none"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-4 rounded-xl font-semibold"
                >
                    Send
                </button>
            </form>
        </div>
    )
}

export default AIChat