import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"

/**
 * Fetches events related to a given event, based on shared booking
 * history — computed server-side by get_related_events().
 */
export const useRelatedEvents = (eventId) => {
    const [relatedEvents, setRelatedEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!eventId) {
            setRelatedEvents([])
            setLoading(false)
            return
        }

        let cancelled = false

        const fetchRelated = async () => {
            setLoading(true)

            const { data, error } = await supabase
                .rpc("get_related_events", { target_event_id: Number(eventId) })

            if (cancelled) return

            if (error) {
                console.error("Failed to load related events:", error.message)
                setRelatedEvents([])
            } else {
                setRelatedEvents(data || [])
            }

            setLoading(false)
        }

        fetchRelated()

        return () => {
            cancelled = true
        }
    }, [eventId])

    return { relatedEvents, loading }
}