import { useState, useEffect, useCallback } from "react"
import { supabase } from "../services/supabase"
import { MOCK_EVENTS } from "../data/mockEvents"

export const EVENT_CATEGORIES = [
    { value: "", label: "All Categories" },
    { value: "tech", label: "Technology & AI" },
    { value: "music", label: "Concerts & Music" },
    { value: "comedy", label: "Standup Comedy" },
    { value: "business", label: "Business & Startups" },
    { value: "workshop", label: "Workshops & Masterclasses" },
    { value: "theatre", label: "Theatre & Arts" },
    { value: "sports", label: "Sports & Fitness" }
]

const PAGE_SIZE = 6

let localCustomEvents = []

export const useEvents = (filters = {}) => {
    const {
        search = "",
        category = "",
        minPrice = "",
        maxPrice = "",
        city = "",
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

        if (minPrice !== "" && minPrice !== null) {
            query = query.gte("price", Number(minPrice))
        }

        if (maxPrice !== "" && maxPrice !== null) {
            query = query.lte("price", Number(maxPrice))
        }

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Database connection timeout")), 2500)
            )

            const { data, error: fetchError, count } = await Promise.race([query, timeoutPromise])

            if (fetchError || !data || data.length === 0) {
                // Apply all active filters to mock fallback dataset
                let fallback = [...localCustomEvents, ...MOCK_EVENTS]

                if (city) {
                    fallback = fallback.filter((e) =>
                        (e.city || "").toLowerCase() === city.toLowerCase() ||
                        (e.venue || "").toLowerCase().includes(city.toLowerCase())
                    )
                }

                if (category) {
                    fallback = fallback.filter((e) => (e.category || "").toLowerCase() === category.toLowerCase())
                }

                if (search.trim()) {
                    const s = search.toLowerCase()
                    fallback = fallback.filter((e) =>
                        (e.title || "").toLowerCase().includes(s) ||
                        (e.venue || "").toLowerCase().includes(s)
                    )
                }

                if (minPrice !== "" && minPrice !== null) {
                    fallback = fallback.filter((e) => Number(e.price) >= Number(minPrice))
                }

                if (maxPrice !== "" && maxPrice !== null) {
                    fallback = fallback.filter((e) => Number(e.price) <= Number(maxPrice))
                }

                const paged = fallback.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                setEvents(paged)
                setTotalCount(fallback.length)
            } else {
                setEvents(data)
                setTotalCount(count ?? data.length)
            }
        } catch {
            let fallback = [...localCustomEvents, ...MOCK_EVENTS]

            if (city) {
                fallback = fallback.filter((e) =>
                    (e.city || "").toLowerCase() === city.toLowerCase() ||
                    (e.venue || "").toLowerCase().includes(city.toLowerCase())
                )
            }

            if (category) {
                fallback = fallback.filter((e) => (e.category || "").toLowerCase() === category.toLowerCase())
            }

            if (search.trim()) {
                const s = search.toLowerCase()
                fallback = fallback.filter((e) =>
                    (e.title || "").toLowerCase().includes(s) ||
                    (e.venue || "").toLowerCase().includes(s)
                )
            }

            if (minPrice !== "" && minPrice !== null) {
                fallback = fallback.filter((e) => Number(e.price) >= Number(minPrice))
            }

            if (maxPrice !== "" && maxPrice !== null) {
                fallback = fallback.filter((e) => Number(e.price) <= Number(maxPrice))
            }

            const paged = fallback.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
            setEvents(paged)
            setTotalCount(fallback.length)
        } finally {
            setLoading(false)
        }
    }, [search, category, minPrice, maxPrice, city, page])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const createEvent = async (eventData) => {
        try {
            const { data, error: createError } = await supabase.from("events").insert([eventData]).select().single()
            if (createError) {
                // If remote fails, save locally
                const newEv = {
                    id: Date.now(),
                    ...eventData,
                    banner_url: eventData.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
                }
                localCustomEvents.unshift(newEv)
                await fetchEvents()
                return { success: true }
            }
            await fetchEvents()
            return { success: true, event: data }
        } catch {
            const newEv = {
                id: Date.now(),
                ...eventData,
                banner_url: eventData.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
            }
            localCustomEvents.unshift(newEv)
            await fetchEvents()
            return { success: true }
        }
    }

    const updateEvent = async (id, eventData) => {
        try {
            const { error: updateError } = await supabase.from("events").update(eventData).eq("id", id)
            if (updateError) {
                localCustomEvents = localCustomEvents.map((e) => (e.id === id ? { ...e, ...eventData } : e))
                await fetchEvents()
                return { success: true }
            }
            await fetchEvents()
            return { success: true }
        } catch {
            localCustomEvents = localCustomEvents.map((e) => (e.id === id ? { ...e, ...eventData } : e))
            await fetchEvents()
            return { success: true }
        }
    }

    const deleteEvent = async (id) => {
        try {
            const { error: deleteError } = await supabase.from("events").delete().eq("id", id)
            if (deleteError) {
                localCustomEvents = localCustomEvents.filter((e) => e.id !== id)
                await fetchEvents()
                return { success: true }
            }
            await fetchEvents()
            return { success: true }
        } catch {
            localCustomEvents = localCustomEvents.filter((e) => e.id !== id)
            await fetchEvents()
            return { success: true }
        }
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

    return {
        events,
        totalCount,
        totalPages,
        loading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        refetch: fetchEvents
    }
}