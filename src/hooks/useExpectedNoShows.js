import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"

export const useExpectedNoShows = (eventId) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!eventId) {
            setData(null)
            setLoading(false)
            return
        }

        let cancelled = false

        const fetchData = async () => {
            setLoading(true)

            const { data: result, error } = await supabase
                .rpc("get_event_expected_noshows", { target_event_id: Number(eventId) })

            if (cancelled) return

            if (error) {
                console.error("Failed to load expected no-shows:", error.message)
                setData(null)
            } else if (result && result.length > 0) {
                setData(result[0])
            }

            setLoading(false)
        }

        fetchData()

        return () => {
            cancelled = true
        }
    }, [eventId])

    return { data, loading }
}