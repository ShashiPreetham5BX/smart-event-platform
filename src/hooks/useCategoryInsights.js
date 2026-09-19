import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"

/**
 * Fetches aggregate booking statistics for a given event category —
 * used to give organizers a data-informed projection when creating
 * a new event (the "Digital Twin" simulation).
 */
export const useCategoryInsights = (category) => {
    const [insights, setInsights] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!category) {
            setInsights(null)
            return
        }

        let cancelled = false

        const fetchInsights = async () => {
            setLoading(true)

            const { data, error } = await supabase
                .rpc("get_category_insights", { target_category: category })

            if (cancelled) return

            if (error) {
                console.error("Failed to load category insights:", error.message)
                setInsights(null)
            } else if (data && data.length > 0) {
                setInsights(data[0])
            }

            setLoading(false)
        }

        fetchInsights()

        return () => {
            cancelled = true
        }
    }, [category])

    return { insights, loading }
}