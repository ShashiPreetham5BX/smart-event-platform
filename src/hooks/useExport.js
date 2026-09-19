import { supabase } from "../services/supabase"

// Converts an array of flat objects into a CSV string and triggers
// a browser download — no external library needed for something this simple.
const downloadCSV = (rows, filename) => {
    if (rows.length === 0) return

    const headers = Object.keys(rows[0])

    const escapeCell = (value) => {
        const str = String(value ?? "")
        // Wrap in quotes and escape any existing quotes, if the value
        // contains a comma, quote, or newline — standard CSV escaping.
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`
        }
        return str
    }

    const csvContent = [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export const useExport = () => {
    const exportBookings = async (eventId) => {
        let query = supabase
            .from("bookings")
            .select(`
        id,
        ticket_count,
        total_amount,
        booked_at,
        events ( title, venue ),
        users ( full_name, email )
      `)
            .order("booked_at", { ascending: false })

        if (eventId) {
            query = query.eq("event_id", eventId)
        }

        const { data, error } = await query

        if (error) {
            return { success: false, error: error.message }
        }

        if (!data || data.length === 0) {
            return { success: false, error: "No bookings to export." }
        }

        const rows = data.map((b) => ({
            "Ticket ID": b.id,
            "Event": b.events?.title || "",
            "Venue": b.events?.venue || "",
            "Attendee Name": b.users?.full_name || "",
            "Attendee Email": b.users?.email || "",
            "Tickets": b.ticket_count,
            "Amount (₹)": b.total_amount,
            "Booked At": new Date(b.booked_at).toLocaleString()
        }))

        const filename = eventId
            ? `bookings-event-${eventId}-${Date.now()}.csv`
            : `all-bookings-${Date.now()}.csv`

        downloadCSV(rows, filename)
        return { success: true }
    }

    return { exportBookings }
}