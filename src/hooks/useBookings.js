import { useState, useEffect, useCallback } from "react"
import QRCode from "qrcode"
import { supabase } from "../services/supabase"
import { useAuth } from "../context/AuthContext"

export const useBookings = () => {
    const { user } = useAuth()

    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch this user's bookings, including the event details for each one
    const fetchBookings = useCallback(async () => {
        if (!user) {
            setBookings([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
            .from("bookings")
            .select(`
        *,
        events (
          title,
          venue
        )
      `)
            .eq("user_id", user.id)
            .order("id", { ascending: false })

        if (fetchError) {
            setError(fetchError.message)
        } else {
            setBookings(data)
        }

        setLoading(false)
    }, [user])

    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    // Check if the current user already booked a specific event
    const hasBooked = useCallback(
        (eventId) => bookings.some((b) => b.event_id === eventId),
        [bookings]
    )

    // CREATE a booking — this is the one place QR generation happens now
    const createBooking = async (event) => {
        if (!user) {
            return { success: false, error: "Please login first." }
        }

        if (event.event_date) {
            const { data: conflicting } = await supabase
                .from("bookings")
                .select("id, events!inner(event_date, title)")
                .eq("user_id", user.id)
                .eq("events.event_date", event.event_date)

            if (conflicting && conflicting.length > 0) {
                return {
                    success: false,
                    error: `You already have a booking on this date (${conflicting[0].events.title}). You can't book two events on the same day.`
                }
            }
        }

        // Insert the booking FIRST — this is what triggers the database to
        // auto-generate a secure ticket_token (see generate_ticket_token()
        // trigger). We need that token back before we can generate the QR.
        const { data: inserted, error: insertError } = await supabase
            .from("bookings")
            .insert([
                {
                    user_id: user.id,
                    event_id: event.id,
                    ticket_count: 1,
                    total_amount: event.price
                }
            ])
            .select("id, ticket_token")
            .single()

        if (insertError) {
            return { success: false, error: insertError.message }
        }

        // Generate the QR code from the secure token (not raw event details),
        // then save it onto the booking row we just created.
        const qrCode = await QRCode.toDataURL(inserted.ticket_token)

        const { error: qrUpdateError } = await supabase
            .from("bookings")
            .update({ qr_code: qrCode })
            .eq("id", inserted.id)

        if (qrUpdateError) {
            console.error("Failed to save QR code:", qrUpdateError.message)
        }

        await fetchBookings()
        return { success: true }
    }

    return {
        bookings,
        loading,
        error,
        hasBooked,
        createBooking,
        refetch: fetchBookings
    }
}