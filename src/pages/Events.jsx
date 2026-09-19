import { useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"
import { useAuth } from "../context/AuthContext"
import { useEvents, EVENT_CATEGORIES } from "../hooks/useEvents"
import { useBookings } from "../hooks/useBookings"
import EventCard from "../components/EventCard"
import EventFilters from "../components/EventFilters"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import EmptyState from "../components/ui/EmptyState"
import Modal from "../components/ui/Modal"
import { useToast } from "../context/ToastContext"
import CategoryInsightPanel from "../components/ui/CategoryInsightPanel"

const Events = () => {
  const { user, role } = useAuth()
  const { showToast } = useToast()

  const [filters, setFilters] = useState({ search: "", category: "", minPrice: "", maxPrice: "", page: 1 })
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }, [])
  const goToPage = (pageNumber) => setFilters((prev) => ({ ...prev, page: pageNumber }))

  const { events, totalPages, loading, error, createEvent, updateEvent, deleteEvent } = useEvents(filters)
  const { createBooking } = useBookings()

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
    if (!title.trim() || !venue.trim() || !price || Number(price) <= 0 || !eventDate || !eventTime) {
      showToast("Please fill in all fields, including date and time.", "error")
      return
    }

    setCreating(true)

    try {
      let imageUrl = ""
      if (image) {
        const fileName = `${Date.now()}-${image.name}`

        const uploadPromise = supabase.storage.from("event-images").upload(fileName, image)
        const uploadTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Image upload timed out. Please try again.")), 15000)
        )

        const { error: uploadError } = await Promise.race([uploadPromise, uploadTimeout])

        if (uploadError) {
          showToast(uploadError.message, "error")
          return
        }

        const { data } = supabase.storage.from("event-images").getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

      const createPromise = createEvent({
        title,
        venue,
        price,
        category,
        capacity: capacity ? Number(capacity) : null,
        event_date: eventDate,
        event_time: eventTime,
        banner_url: imageUrl
      })
      const createTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), 15000)
      )

      const result = await Promise.race([createPromise, createTimeout])

      if (!result.success) {
        showToast(result.error, "error")
        return
      }

      showToast("Event created successfully")
      setTitle("")
      setVenue("")
      setPrice("")
      setCategory("general")
      setCapacity("")
      setEventDate("")
      setEventTime("")
      setImage(null)
    } catch (err) {
      showToast(err.message || "Something went wrong. Please try again.", "error")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id)
  }

  const confirmDelete = async () => {
    const id = deleteTargetId
    setDeleteTargetId(null)

    const result = await deleteEvent(id)
    if (!result.success) {
      showToast(result.error, "error")
    } else {
      showToast("Event deleted")
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
      price: editPrice,
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

  const handleBooking = async (event) => {
    const result = await createBooking(event)
    if (!result.success) {
      showToast(result.error, "error")
    } else {
      showToast("Ticket booked successfully")
    }
  }

  const selectClasses = "w-full px-4 py-3 rounded-lg bg-surface border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"

  if (error) {
    return <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">Something went wrong: {error}</div>
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary p-6 md:p-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Events</h1>
      <p className="text-text-secondary mb-10">Discover and manage upcoming events.</p>

      {role === "organizer" && (
        <form onSubmit={handleCreateEvent} className="bg-surface border border-border rounded-xl p-6 space-y-5 max-w-xl mb-14">
          <h2 className="text-lg font-semibold">Create a new event</h2>

          <Input label="Event Title" placeholder="e.g. AI Tech Conference" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Venue" placeholder="e.g. Hyderabad Convention Centre" value={venue} onChange={(e) => setVenue(e.target.value)} />
          <Input label="Price (₹)" type="number" placeholder="e.g. 999" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input label="Capacity (optional)" type="number" placeholder="Leave blank for unlimited" value={capacity} onChange={(e) => setCapacity(e.target.value)} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Event Date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            <Input label="Event Time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClasses}>
              {EVENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <CategoryInsightPanel category={category} />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Event Banner</label>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent-soft file:text-accent file:font-medium hover:file:bg-accent/30"
            />
          </div>

          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Event"}
          </Button>
        </form>
      )}

      <EventFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl h-80 animate-pulse" />
          ))}
        </div>) : events.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No events match your filters"
            description="Try adjusting your search, category, or price range to see more results."
          />
        ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id}>
              <Link to={`/events/${event.id}`}>
                <EventCard
                  event={event}
                  role={role}
                  onDelete={(e) => { e.preventDefault(); handleDeleteClick(event.id) }}
                  onEdit={(e) => { e.preventDefault(); handleEdit(event) }}
                  onBook={(e) => { e.preventDefault(); handleBooking(event) }}
                />
              </Link>

              {editingId === event.id && (
                <div className="mt-3 space-y-4 bg-surface p-5 rounded-xl border border-border">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  <Input value={editVenue} onChange={(e) => setEditVenue(e.target.value)} />
                  <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <Input
                    type="number"
                    placeholder="Capacity (leave blank for unlimited)"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                    <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                  </div>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={selectClasses}>
                    {EVENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <Button variant="success" size="sm" onClick={() => handleUpdate(event.id)}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-14">
          <Button variant="ghost" size="sm" disabled={filters.page <= 1} onClick={() => goToPage(filters.page - 1)}>
            Previous
          </Button>
          <span className="text-text-secondary text-sm">Page {filters.page} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={filters.page >= totalPages} onClick={() => goToPage(filters.page + 1)}>
            Next
          </Button>
        </div>
      )}
      <Modal
        open={deleteTargetId !== null}
        title="Delete this event?"
        description="This will permanently remove the event. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

    </div>
  )
}

export default Events