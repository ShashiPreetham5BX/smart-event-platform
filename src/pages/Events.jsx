import { useState, useCallback, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { supabase } from "../services/supabase"
import { useAuth } from "../context/AuthContext"
import { useEvents, EVENT_CATEGORIES } from "../hooks/useEvents"
import EventCard from "../components/EventCard"
import EventFilters from "../components/EventFilters"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import EmptyState from "../components/ui/EmptyState"
import Modal from "../components/ui/Modal"
import CheckoutModal from "../components/CheckoutModal"
import { useToast } from "../context/ToastContext"
import CategoryInsightPanel from "../components/ui/CategoryInsightPanel"
import { FaPlus, FaCalendarPlus } from "react-icons/fa"

const Events = () => {
  const { user, role } = useAuth()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()

  const urlCategory = searchParams.get("category") || ""
  const urlSearch = searchParams.get("search") || ""

  const [filters, setFilters] = useState({
    search: urlSearch,
    category: urlCategory,
    minPrice: "",
    maxPrice: "",
    page: 1
  })

  useEffect(() => {
    if (urlCategory || urlSearch) {
      setFilters((prev) => ({
        ...prev,
        category: urlCategory,
        search: urlSearch,
        page: 1
      }))
    }
  }, [urlCategory, urlSearch])

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }, [])

  const goToPage = (pageNumber) => setFilters((prev) => ({ ...prev, page: pageNumber }))

  const { events, totalPages, loading, error, createEvent, updateEvent, deleteEvent } = useEvents(filters)

  // Booking Modal State
  const [bookingEvent, setBookingEvent] = useState(null)

  // Organizer Create / Edit States
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState("")
  const [venue, setVenue] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("general")
  const [capacity, setCapacity] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [image, setImage] = useState(null)
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editVenue, setEditVenue] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editCategory, setEditCategory] = useState("general")
  const [editCapacity, setEditCapacity] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editTime, setEditTime] = useState("")
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!title.trim() || !venue.trim() || !price || Number(price) < 0 || !eventDate || !eventTime) {
      showToast("Please fill in title, venue, price, date, and time.", "error")
      return
    }

    setCreating(true)

    try {
      let imageUrl = ""
      if (image) {
        const fileName = `${Date.now()}-${image.name}`
        const { error: uploadError } = await supabase.storage.from("event-images").upload(fileName, image)
        if (uploadError) {
          showToast(uploadError.message, "error")
          return
        }
        const { data } = supabase.storage.from("event-images").getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

      const result = await createEvent({
        title,
        venue,
        price: Number(price),
        category,
        capacity: capacity ? Number(capacity) : null,
        event_date: eventDate,
        event_time: eventTime,
        banner_url: imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        organizer_id: user?.id
      })

      if (!result.success) {
        showToast(result.error, "error")
        return
      }

      showToast("Event created successfully!")
      setTitle("")
      setVenue("")
      setPrice("")
      setCategory("general")
      setCapacity("")
      setEventDate("")
      setEventTime("")
      setImage(null)
      setShowCreateForm(false)
    } catch (err) {
      showToast(err.message || "Failed to create event", "error")
    } finally {
      setCreating(false)
    }
  }

  const confirmDelete = async () => {
    const id = deleteTargetId
    setDeleteTargetId(null)
    const result = await deleteEvent(id)
    if (!result.success) {
      showToast(result.error, "error")
    } else {
      showToast("Event deleted successfully")
    }
  }

  const handleEdit = (event) => {
    setEditingId(event.id)
    setEditTitle(event.title)
    setEditVenue(event.venue)
    setEditPrice(event.price)
    setEditCategory(event.category || "general")
    setEditCapacity(event.capacity ?? "")
    setEditDate(event.event_date || "")
    setEditTime(event.event_time || "")
  }

  const handleUpdate = async (id) => {
    const result = await updateEvent(id, {
      title: editTitle,
      venue: editVenue,
      price: Number(editPrice),
      category: editCategory,
      capacity: editCapacity ? Number(editCapacity) : null,
      event_date: editDate,
      event_time: editTime
    })
    if (!result.success) {
      showToast(result.error, "error")
    } else {
      showToast("Event updated successfully")
      setEditingId(null)
    }
  }

  const handleCompleteBooking = async (payload) => {
    if (!bookingEvent) return { success: false, error: "No event selected" }

    try {
      if (bookingEvent.event_date) {
        const { data: conflicting } = await supabase
          .from("bookings")
          .select("id, events!inner(event_date, title)")
          .eq("user_id", user?.id)
          .eq("events.event_date", bookingEvent.event_date)

        if (conflicting && conflicting.length > 0) {
          const msg = `You already have a booking on this date (${conflicting[0].events.title}). You can't book two events on the same day.`
          showToast(msg, "error")
          return { success: false, error: msg }
        }
      }

      const QRCode = (await import("qrcode")).default

      const { data: inserted, error: insertError } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: user?.id,
            event_id: bookingEvent.id,
            ticket_count: payload.quantity || 1,
            total_amount: payload.totalAmount || bookingEvent.price
          }
        ])
        .select("id, ticket_token")
        .single()

      if (insertError) {
        showToast(insertError.message, "error")
        return { success: false, error: insertError.message }
      }

      const qrCode = await QRCode.toDataURL(inserted.ticket_token)
      await supabase
        .from("bookings")
        .update({ qr_code: qrCode })
        .eq("id", inserted.id)

      showToast(`Booked ${payload.quantity} ticket(s) for ${bookingEvent.title}!`)
      return { success: true, bookingId: inserted.id }
    } catch (err) {
      showToast(err.message, "error")
      return { success: false, error: err.message }
    }
  }

  const selectClasses =
    "w-full px-4 py-2.5 rounded-xl bg-surface-hover border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center p-6 text-center">
        Something went wrong: {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary p-4 md:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Explore Events</h1>
          <p className="text-text-secondary text-xs md:text-sm mt-1">
            Discover trending concerts, conferences, meetups, and workshops
          </p>
        </div>

        {role === "organizer" && (
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            {showCreateForm ? <FaPlus className="rotate-45" /> : <FaCalendarPlus />}
            {showCreateForm ? "Close Event Form" : "Host New Event"}
          </button>
        )}
      </div>

      {/* Organizer Create Event Panel */}
      {role === "organizer" && showCreateForm && (
        <form
          onSubmit={handleCreateEvent}
          className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-4 max-w-2xl mb-8 shadow-elevated animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-bold text-text-primary">Create & Publish Event</h2>
            <span className="text-xs text-text-muted">Organizer Studio</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Event Title" placeholder="e.g. AI Dev Con 2026" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Venue" placeholder="e.g. Hitex Hall 3, Hyderabad" value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Ticket Price (₹)" type="number" placeholder="e.g. 499" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input label="Capacity" type="number" placeholder="e.g. 250" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Event Date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            <Input label="Event Time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClasses}>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {category && (
              <div className="mt-2.5">
                <CategoryInsightPanel category={category} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Event Poster (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="text-xs text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-surface-hover file:text-text-primary hover:file:bg-border cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={creating}>
              {creating ? "Publishing Event..." : "Publish Event"}
            </Button>
          </div>
        </form>
      )}

      {/* Advanced Filters */}
      <EventFilters
        onFilterChange={handleFilterChange}
        initialCategory={filters.category}
      />

      {/* Event List / Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No events match your criteria"
          description="Try clearing search keywords, adjusting price range, or switching categories."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="h-full">
              {editingId === event.id ? (
                /* Inline Edit Mode for Organizers */
                <div className="bg-surface border border-accent/40 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-accent">Edit Event #{event.id}</h3>
                  <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  <Input label="Venue" value={editVenue} onChange={(e) => setEditVenue(e.target.value)} />
                  <Input label="Price (₹)" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Date" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                    <Input label="Time" type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="primary" size="sm" onClick={() => handleUpdate(event.id)}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Link to={`/events/${event.id}`} className="block h-full">
                  <EventCard
                    event={event}
                    role={role}
                    onEdit={(e) => {
                      e.preventDefault()
                      handleEdit(event)
                    }}
                    onDelete={(e) => {
                      e.preventDefault()
                      setDeleteTargetId(event.id)
                    }}
                    onBook={(e) => {
                      e.preventDefault()
                      setBookingEvent(event)
                    }}
                  />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filters.page === p
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTargetId}
        title="Delete this event?"
        description="Are you sure you want to permanently delete this event? This action cannot be undone."
        confirmLabel="Delete Event"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Quick Booking Modal */}
      <CheckoutModal
        open={!!bookingEvent}
        event={bookingEvent}
        user={user}
        onClose={() => setBookingEvent(null)}
        onCompleteBooking={handleCompleteBooking}
      />
    </div>
  )
}

export default Events