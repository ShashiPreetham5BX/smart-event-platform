import { useState, useEffect, useCallback } from "react"
import { supabase } from "../services/supabase"
import { logAction } from "./useAuditLog"
export const EVENT_CATEGORIES = [
    { value: "general", label: "General" },
    { value: "tech", label: "Tech" },
    { value: "music", label: "Music" },
    { value: "business", label: "Business" },
    { value: "sports", label: "Sports" },
    { value: "arts", label: "Arts & Culture" }
]

const PAGE_SIZE = 6

export const useEvents = (filters = {}) => {
    const {
        search = "",
        category = "",
        minPrice = "",
        maxPrice = "",
        page = 1
    } = filters

    const [events, setEvents] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchEvents = useCallback(async () => {
        setLoading(true)
        setError(null)

        const from = (page - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        let query = supabase
            .from("events")
            .select("*", { count: "exact" })
            .order("id", { ascending: false })
            .range(from, to)

        if (search.trim()) {
            const term = search.trim().replace(/[%,]/g, "")
            query = query.or(`title.ilike.%${term}%,venue.ilike.%${term}%`)
        }

        if (category) {
            query = query.eq("category", category)
        }

        if (minPrice) {
            query = query.gte("price", Number(minPrice))
        }

        if (maxPrice) {
            query = query.lte("price", Number(maxPrice))
        }

        const { data, error: fetchError, count } = await query

        if (fetchError) {
            setError(fetchError.message)
        } else {
            setEvents(data || [])
            setTotalCount(count ?? 0)
        }

        setLoading(false)
    }, [search, category, minPrice, maxPrice, page])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const createEvent = async (eventData) => {
        const { error: createError } = await supabase.from("events").insert([eventData])
        if (createError) return { success: false, error: createError.message }
        await fetchEvents()
        return { success: true }
    }

    const updateEvent = async (id, updates) => {
        const { error: updateError } = await supabase.from("events").update(updates).eq("id", id)
        if (updateError) return { success: false, error: updateError.message }
        await fetchEvents()
        return { success: true }
    }

    const deleteEvent = async (id) => {
        const eventBeingDeleted = events.find((e) => e.id === id)

        const { error: deleteError } = await supabase.from("events").delete().eq("id", id)
        if (deleteError) return { success: false, error: deleteError.message }

        logAction("delete", "event", id, { title: eventBeingDeleted?.title })

        await fetchEvents()
        return { success: true }
    }

    return {
        events,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
        loading,
        error,
        refetch: fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent
    }
}