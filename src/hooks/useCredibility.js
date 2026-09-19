import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"

/**
 * Fetches a trust-weighted credibility score (0-100) for a given user,
 * computed server-side by the get_user_credibility() Postgres function.
 *
 * The score factors in: number of past bookings, account age, and the
 * average thoughtfulness (comment length) of the user's past reviews.
 */
export const useCredibility = (userId) => {
    const [score, setScore] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!userId) {
            setScore(null)
            setLoading(false)
            return
        }

        let cancelled = false

        const fetchCredibility = async () => {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .rpc("get_user_credibility", { target_user_id: userId })

            // Guard against a slow response landing after this component
            // already unmounted or userId already changed to something else.
            if (cancelled) return

            if (fetchError) {
                setError(fetchError.message)
                setScore(null)
            } else if (data && data.length > 0) {
                setScore(data[0].credibility_score)
            } else {
                setScore(null)
            }

            setLoading(false)
        }

        fetchCredibility()

        return () => {
            cancelled = true
        }
    }, [userId])

    return { score, loading, error }
}