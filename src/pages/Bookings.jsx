import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import jsPDF from "jspdf"
import { useAuth } from "../context/AuthContext"

const Bookings = () => {

  const [bookings, setBookings] = useState([])

  const { user } = useAuth()

  // FETCH BOOKINGS

  const fetchBookings = async () => {

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        events (
          title,
          venue
        )
      `)

    if (error) {

      console.log(error)
    }
    else {

      setBookings(data)
    }
  }

  // DOWNLOAD PDF

  const downloadTicket = (booking) => {

    const doc = new jsPDF()

    // HEADER

    doc.setFillColor(20, 20, 20)

    doc.rect(0, 0, 210, 35, "F")

    doc.setTextColor(255, 255, 255)

    doc.setFontSize(24)

    doc.text("EVENT TICKET", 20, 22)

    // RESET TEXT COLOR

    doc.setTextColor(0, 0, 0)

    // TICKET DETAILS

    doc.setFontSize(16)

    doc.text(`Ticket ID: ${booking.id}`, 20, 50)

    doc.text(
      `Customer Name: ${user?.email?.split("@")[0]}`,
      20,
      65
    )

    doc.text(
      `Customer Email: ${user?.email}`,
      20,
      80
    )

    doc.text(
      `Event: ${booking.events?.title}`,
      20,
      95
    )

    doc.text(
      `Venue: ${booking.events?.venue}`,
      20,
      110
    )

    doc.text(
      `Ticket Count: ${booking.ticket_count}`,
      20,
      125
    )

    doc.text(
      `Total Amount: ₹ ${booking.total_amount}`,
      20,
      140
    )

    // BOOKING DATE

    doc.text(
      `Booking Date: ${new Date(
        booking.booked_at
      ).toLocaleString()}`,
      20,
      155
    )

    // QR CODE

    if (booking.qr_code) {

      doc.addImage(
        booking.qr_code,
        "PNG",
        120,
        55,
        60,
        60
      )
    }

    // FOOTER

    doc.setFontSize(12)

    doc.setTextColor(100)

    doc.text(
      "Please carry this ticket during event entry.",
      20,
      190
    )

    doc.text(
      "Powered by EventAI Platform",
      20,
      200
    )

    // SAVE PDF

    doc.save(`ticket-${booking.id}.pdf`)
  }

  // LOAD BOOKINGS

  useEffect(() => {

    fetchBookings()

  }, [])

  return (

    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        My Tickets
      </h1>

      <div className="grid md:grid-cols-3 gap-8">

        {bookings.map((booking) => (

          <div
            key={booking.id}
            className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
          >

            <h2 className="text-2xl font-bold mb-4">
              Ticket #{booking.id}
            </h2>

            <p className="text-zinc-400">
              Event:
              {" "}
              {booking.events?.title}
            </p>

            <p className="text-zinc-400 mt-2">
              Venue:
              {" "}
              {booking.events?.venue}
            </p>

            <p className="text-blue-400 mt-4 text-xl font-semibold">
              ₹ {booking.total_amount}
            </p>

            {/* QR CODE */}

            {booking.qr_code && (

              <img
                src={booking.qr_code}
                alt="QR"
                className="mt-6 rounded-xl bg-white p-4 w-52"
              />

            )}

            {/* DOWNLOAD BUTTON */}

            <button
              onClick={() => downloadTicket(booking)}
              className="mt-6 bg-blue-500 hover:bg-blue-600 px-5 py-3 rounded-xl"
            >
              Download PDF
            </button>

          </div>

        ))}

      </div>

    </div>
  )
}

export default Bookings