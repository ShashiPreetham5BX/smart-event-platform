import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"

/**
 * Fetches a booking-velocity comparison for a given event against
 * others in its category — the data behind the pricing suggestion.
 */
export const usePricingSignal = (eventId) => {
    const [signal, setSignal] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!eventId) {
            setSignal(null)
            setLoading(false)
            return
        }

        let cancelled = false

        const fetchSignal = async () => {
            setLoading(true)

            const { data, error } = await supabase
                .rpc("get_pricing_signal", { target_event_id: Number(eventId) })

            if (cancelled) return

            if (error) {
                console.error("Failed to load pricing signal:", error.message)
                setSignal(null)
            } else if (data && data.length > 0) {
                setSignal(data[0])
            }

            setLoading(false)
        }

        fetchSignal()

        return () => {
            cancelled = true
        }
    }, [eventId])

    return { signal, loading }
}