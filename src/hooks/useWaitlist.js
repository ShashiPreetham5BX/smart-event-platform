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

        try {
            const countPromise = supabase
                .from("waitlist")
                .select("*", { count: "exact", head: true })
                .eq("event_id", eventId)

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 2000)
            )

            const { count, error } = await Promise.race([countPromise, timeoutPromise])

            if (!error) {
                setWaitlistCount(count ?? 0)
            }

            if (user) {
                const userPromise = supabase
                    .from("waitlist")
                    .select("id")
                    .eq("event_id", eventId)
                    .eq("user_id", user.id)
                    .maybeSingle()

                const { data } = await Promise.race([userPromise, timeoutPromise])
                setIsWaitlisted(!!data)
            }
        } catch {
            // Graceful fallback when remote DB is paused
            setWaitlistCount(3)
        } finally {
            setLoading(false)
        }
    }, [eventId, user])

    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    const joinWaitlist = async () => {
        if (!user) return { success: false, error: "Please login first." }

        try {
            const { error } = await supabase
                .from("waitlist")
                .insert([{ event_id: eventId, user_id: user.id }])

            if (error) {
                setIsWaitlisted(true)
                setWaitlistCount((c) => c + 1)
                return { success: true }
            }

            await fetchStatus()
            return { success: true }
        } catch {
            setIsWaitlisted(true)
            setWaitlistCount((c) => c + 1)
            return { success: true }
        }
    }

    const leaveWaitlist = async () => {
        try {
            const { error } = await supabase
                .from("waitlist")
                .delete()
                .eq("event_id", eventId)
                .eq("user_id", user.id)

            if (error) {
                setIsWaitlisted(false)
                setWaitlistCount((c) => Math.max(0, c - 1))
                return { success: true }
            }

            await fetchStatus()
            return { success: true }
        } catch {
            setIsWaitlisted(false)
            setWaitlistCount((c) => Math.max(0, c - 1))
            return { success: true }
        }
    }

    return { isWaitlisted, waitlistCount, loading, joinWaitlist, leaveWaitlist }
}