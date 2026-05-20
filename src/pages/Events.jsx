import QRCode from "qrcode"
import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

const Events = () => {

  // CREATE EVENT STATES
  const [title, setTitle] = useState("")
  const [venue, setVenue] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState(null)
  // FETCHED EVENTS
  const [events, setEvents] = useState([])

  // EDIT STATES
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editVenue, setEditVenue] = useState("")
  const [editPrice, setEditPrice] = useState("")

  // FETCH EVENTS
  const fetchEvents = async () => {

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("id", { ascending: false })

  if (error) {

    console.log(error)
  }
  else {

    console.log(data)

    setEvents(data)
  }
}

  // CREATE EVENT
  const handleCreateEvent = async (e) => {

  e.preventDefault()

  let imageUrl = ""

  // IMAGE UPLOAD

  if (image) {

    const fileName = `${Date.now()}-${image.name}`

    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(fileName, image)

    if (uploadError) {
      alert(uploadError.message)
      return
    }

    // GET PUBLIC URL

    const { data } = supabase.storage
      .from("event-images")
      .getPublicUrl(fileName)

    imageUrl = data.publicUrl
  }

  // SAVE EVENT

  const { error } = await supabase
    .from("events")
    .insert([
      {
        title: title,
        venue: venue,
        price: price,
        banner_url: imageUrl
      }
    ])

  if (error) {
    alert(error.message)
  }
  else {

    alert("Event Created Successfully")

    fetchEvents()

    setTitle("")
    setVenue("")
    setPrice("")
    setImage(null)
  }
}
  // DELETE EVENT
  const handleDelete = async (id) => {

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
    }
    else {

      alert("Event Deleted")

      fetchEvents()
    }
  }

  // OPEN EDIT FORM
  const handleEdit = (event) => {

    setEditingId(event.id)

    setEditTitle(event.title)
    setEditVenue(event.venue)
    setEditPrice(event.price)
  }

  // UPDATE EVENT
  const handleUpdate = async (id) => {

    const { error } = await supabase
      .from("events")
      .update({
        title: editTitle,
        venue: editVenue,
        price: editPrice
      })
      .eq("id", id)

    if (error) {
      alert(error.message)
    }
    else {

      alert("Event Updated Successfully")

      setEditingId(null)

      fetchEvents()
    }
  }
const handleBooking = async (event) => {

  // GENERATE UNIQUE TICKET DATA

  const ticketData = `
    Event: ${event.title}
    Venue: ${event.venue}
    Price: ${event.price}
    Time: ${new Date().toLocaleString()}
  `

  // GENERATE QR IMAGE

  const qrCode = await QRCode.toDataURL(ticketData)

  // SAVE BOOKING

  const { error } = await supabase
    .from("bookings")
    .insert([
      {
        user_id: 1,
        event_id: event.id,
        ticket_count: 1,
        total_amount: event.price,
        qr_code: qrCode
      }
    ])

  if (error) {

    alert(error.message)
  }
  else {

    alert("Ticket Booked Successfully")

    fetchEvents()
  }
}
  // LOAD EVENTS ON PAGE OPEN
  useEffect(() => {
    fetchEvents()
  }, [])

  return (

    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        Event Management System
      </h1>

      {/* CREATE EVENT FORM */}

      <form
        onSubmit={handleCreateEvent}
        className="space-y-6 max-w-xl"
      >

        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-900 outline-none"
        />

        <input
          type="text"
          placeholder="Venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-900 outline-none"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-900 outline-none"
        />
        <input
  type="file"
  onChange={(e) => setImage(e.target.files[0])}
  className="w-full p-4 rounded-xl bg-zinc-900"
/>
        <button
          className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl"
        >
          Create Event
        </button>

      </form>

      {/* EVENTS DISPLAY */}

      <div className="grid md:grid-cols-3 gap-8 mt-16">

        {events.map((event) => (

          <div
            key={event.id}
            className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
          >
{event.banner_url && (

  <img
    src={event.banner_url}
    alt="event"
    className="w-full h-52 object-cover rounded-xl mb-5"
  />

)}
            <h2 className="text-3xl font-bold">
              {event.title}
            </h2>

            <p className="text-zinc-400 mt-4">
              {event.venue}
            </p>

            <p className="text-blue-400 mt-4 text-xl font-semibold">
              ₹ {event.price}
            </p>

            {/* DELETE BUTTON */}

            <button
              onClick={() => handleDelete(event.id)}
              className="mt-6 bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl"
            >
              Delete
            </button>

            {/* EDIT BUTTON */}

            <button
              onClick={() => handleEdit(event)}
              className="mt-6 ml-4 bg-yellow-500 hover:bg-yellow-600 px-5 py-3 rounded-xl"
            >
              Edit
            </button>
            <button
  onClick={() => handleBooking(event)}
  className="mt-4 bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl"
>
  Book Ticket
</button>

            {/* EDIT FORM */}

            {editingId === event.id && (

              <div className="mt-6 space-y-4">

                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-800 outline-none"
                />

                <input
                  type="text"
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-800 outline-none"
                />

                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-800 outline-none"
                />

                <button
                  onClick={() => handleUpdate(event.id)}
                  className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl"
                >
                  Save Changes
                </button>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  )
}

export default Events