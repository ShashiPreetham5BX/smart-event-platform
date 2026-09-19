import { usePricingSignal } from "../../hooks/usePricingSignal"

const PricingAssistant = ({ eventId }) => {
    const { signal, loading } = usePricingSignal(eventId)

    if (loading) return null
    if (!signal || signal.signal === "insufficient_data") return null

    const messages = {
        booking_fast: {
            icon: "📈",
            text: `This event is booking ${signal.event_velocity} tickets/day — noticeably faster than similar events in this category (avg ${signal.category_avg_velocity}/day). You could consider a modest price increase for remaining tickets.`,
            color: "border-success/30 bg-success/10 text-success"
        },
        booking_slow: {
            icon: "📉",
            text: `This event is booking ${signal.event_velocity} tickets/day — slower than similar events in this category (avg ${signal.category_avg_velocity}/day). A limited-time discount might help boost interest.`,
            color: "border-warning/30 bg-warning/10 text-warning"
        },
        typical: {
            icon: "📊",
            text: `This event is booking at a typical pace for its category (${signal.event_velocity} vs avg ${signal.category_avg_velocity} tickets/day). No pricing changes suggested right now.`,
            color: "border-border bg-surface text-text-secondary"
        }
    }

    const msg = messages[signal.signal]
    if (!msg) return null

    return (
        <div className={`border rounded-lg p-4 text-sm ${msg.color}`}>
            <p className="font-medium mb-1">{msg.icon} Pricing insight</p>
            <p className="opacity-90">{msg.text}</p>
            <p className="text-xs opacity-60 mt-2">
                This is a suggestion based on your own booking data — you're always in control of pricing.
            </p>
        </div>
    )
}

export default PricingAssistant