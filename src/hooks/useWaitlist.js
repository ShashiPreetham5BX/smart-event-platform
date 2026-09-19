import { useState, useEffect, useCallback } from "react"
import { supabase } from "../services/supabase"
import { useAuth } from "../context/AuthContext"

export const useWaitlist = (eventId) => {
    const { user } = useAuth()
    const [isWaitlisted, setIsWaitlisted] = useState(false)
    const [waitlistCount, setWaitlistCount] = useState(0)
    const [loading, setLoading] = useState(true)

    const fetchStatus = useCallback(async () => {
        if (!eventId) return
        setLoading(true)

        const { count } = await supabase
            .from("waitlist")
            .select("*", { count: "exact", head: true })
            .eq("event_id", eventId)

        setWaitlistCount(count ?? 0)

        if (user) {
            const { data } = await supabase
                .from("waitlist")
                .select("id")
                .eq("event_id", eventId)
                .eq("user_id", user.id)
                .maybeSingle()

            setIsWaitlisted(!!data)
        }

        setLoading(false)
    }, [eventId, user])

    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    const joinWaitlist = async () => {
        if (!user) return { success: false, error: "Please login first." }

        const { error } = await supabase
            .from("waitlist")
            .insert([{ event_id: eventId, user_id: user.id }])

        if (error) return { success: false, error: error.message }

        await fetchStatus()
        return { success: true }
    }

    const leaveWaitlist = async () => {
        const { error } = await supabase
            .from("waitlist")
            .delete()
            .eq("event_id", eventId)
            .eq("user_id", user.id)

        if (error) return { success: false, error: error.message }

        await fetchStatus()
        return { success: true }
    }

    return { isWaitlisted, waitlistCount, loading, joinWaitlist, leaveWaitlist }
}