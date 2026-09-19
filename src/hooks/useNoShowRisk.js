import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"

/**
 * Fetches a no-show risk heuristic for a specific booking — a rules-based
 * signal (not a trained ML model) combining the attendee's past review
 * history and how far in advance they booked.
 */
export const useNoShowRisk = (bookingId) => {
    const [risk, setRisk] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!bookingId) {
            setRisk(null)
            setLoading(false)
            return
        }

        let cancelled = false

        const fetchRisk = async () => {
            setLoading(true)

            const { data, error } = await supabase
                .rpc("get_no_show_risk", { target_booking_id: bookingId })

            if (cancelled) return

            if (error) {
                console.error("Failed to load no-show risk:", error.message)
                setRisk(null)
            } else if (data && data.length > 0) {
                setRisk(data[0])
            }

            setLoading(false)
        }

        fetchRisk()

        return () => {
            cancelled = true
        }
    }, [bookingId])

    return { risk, loading }
}