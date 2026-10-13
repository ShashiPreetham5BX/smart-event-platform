import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"
import { MOCK_EVENTS } from "../data/mockEvents"

/**
 * Fetches events related to a given event, based on shared booking
 * history — computed server-side by get_related_events(), with a smart
 * fallback to category-matched events when offline.
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

            try {
                const rpcPromise = supabase
                    .rpc("get_related_events", { target_event_id: Number(eventId) })

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 2000)
                )

                const { data, error } = await Promise.race([rpcPromise, timeoutPromise])

                if (cancelled) return

                if (!error && data && data.length > 0) {
                    setRelatedEvents(data)
                    setLoading(false)
                    return
                }
            } catch {
                // Backend asleep or RPC unavailable: proceed to intelligent fallback
            }

            if (cancelled) return

            // Smart fallback: find other events from mock data (same category or top picks)
            const currentEvent = MOCK_EVENTS.find((e) => String(e.id) === String(eventId))
            const currentCat = currentEvent?.category || ""

            const related = MOCK_EVENTS
                .filter((e) => String(e.id) !== String(eventId))
                .sort((a, b) => {
                    if (a.category === currentCat && b.category !== currentCat) return -1
                    if (b.category === currentCat && a.category !== currentCat) return 1
                    return 0
                })
                .slice(0, 3)
                .map((e) => ({
                    event_id: e.id,
                    title: e.title,
                    venue: e.venue,
                    price: e.price,
                    banner_url: e.banner_url,
                    category: e.category
                }))

            setRelatedEvents(related)
            setLoading(false)
        }

        fetchRelated()

        return () => {
            cancelled = true
        }
    }, [eventId])

    return { relatedEvents, loading }
}