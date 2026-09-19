import { useState, useEffect, useCallback } from "react"
import { supabase } from "../services/supabase"
import { useAuth } from "../context/AuthContext"

export const useReviews = (eventId) => {
    const { user } = useAuth()

    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchReviews = useCallback(async () => {
        if (!eventId) return

        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
            .from("reviews")
            .select("*")
            .eq("event_id", eventId)
            .order("created_at", { ascending: false })

        if (fetchError) {
            setError(fetchError.message)
        } else {
            setReviews(data || [])
        }

        setLoading(false)
    }, [eventId])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    // Average rating, rounded to 1 decimal place. Returns null if there
    // are no reviews yet, so the UI can show "No ratings yet" instead of "0".
    const averageRating =
        reviews.length === 0
            ? null
            : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10

    const myReview = reviews.find((r) => r.user_id === user?.id) ?? null

    const submitReview = async (rating, comment) => {
        if (!user) {
            return { success: false, error: "Please login first." }
        }

        const { error: submitError } = await supabase
            .from("reviews")
            .upsert(
                { event_id: eventId, user_id: user.id, rating, comment },
                { onConflict: "event_id,user_id" }
            )

        if (submitError) {
            // If this fails because the user never booked the event, Supabase
            // returns a row-level-security policy violation here — surfaced
            // to the user as a normal error message.
            return { success: false, error: submitError.message }
        }

        await fetchReviews()
        return { success: true }
    }

    return { reviews, averageRating, myReview, loading, error, submitReview }
}