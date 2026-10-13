import { useState } from "react"
import jsPDF from "jspdf"
import { FaEnvelope, FaDownload, FaTicketAlt, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { useBookings } from "../hooks/useBookings"
import { useToast } from "../context/ToastContext"
import EmptyState from "../components/ui/EmptyState"
import Spinner from "./../components/ui/Spinner"

const Bookings = () => {
  const { user } = useAuth()
  const { bookings, loading, error } = useBookings()
  const { showToast } = useToast()
  const [emailingId, setEmailingId] = useState(null)

  const downloadTicket = (booking) => {
    const doc = new jsPDF()

    doc.setFillColor(20, 20, 20)
    doc.rect(0, 0, 210, 35, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text("EVENT TICKET", 20, 22)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.text(`Ticket ID: #${booking.id}`, 20, 50)
    doc.text(`Customer Name: ${user?.email?.split("@")[0]}`, 20, 65)
    doc.text(`Customer Email: ${user?.email}`, 20, 80)
    doc.text(`Event: ${booking.events?.title}`, 20, 95)
    doc.text(`Venue: ${booking.events?.venue}`, 20, 110)
    doc.text(`Ticket Count: ${booking.ticket_count || 1}`, 20, 125)
    doc.text(`Total Amount: ₹ ${booking.total_amount}`, 20, 140)
    const bookedDate = booking.booked_at ? new Date(booking.booked_at).toLocaleString() : "Confirmed"
    doc.text(`Booking Date: ${bookedDate}`, 20, 155)

    if (booking.qr_code) {
      doc.addImage(booking.qr_code, "PNG", 120, 55, 60, 60)
    }

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text("Please carry this digital or printed pass during event check-in.", 20, 190)
    doc.text("Powered by EventAI Platform", 20, 200)

    doc.save(`ticket-${booking.id}.pdf`)
    showToast("PDF ticket downloaded successfully!")
  }

  const handleEmailTicket = async (booking) => {
    setEmailingId(booking.id)
    await new Promise((res) => setTimeout(res, 800))
    setEmailingId(null)
    showToast(`Ticket #${booking.id} sent to ${user?.email || "your registered email"}!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" label="Loading your tickets" />
        <p className="text-text-secondary text-sm">Loading your tickets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        Something went wrong: {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <FaTicketAlt className="text-accent" /> My Tickets
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Access your QR codes, download PDF passes, or email tickets for entry
          </p>
        </div>
        <span className="bg-surface border border-border px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary">
          {bookings.length} {bookings.length === 1 ? "Active Ticket" : "Active Tickets"}
        </span>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No tickets yet"
          description="You haven't booked any events. Browse what's happening and grab your first ticket."
          actionLabel="Explore Events"
          actionTo="/events"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-surface p-6 rounded-2xl border border-border hover:border-zinc-700 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-accent bg-accent-soft px-2.5 py-1 rounded-md">
                    Pass #{booking.id}
                  </span>
                  <span className="text-xs text-text-muted">
                    {booking.ticket_count ? `${booking.ticket_count} Seats` : "1 Seat"}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-text-primary mb-2 line-clamp-1">
                  {booking.events?.title || "Event Pass"}
                </h2>

                <p className="text-text-secondary text-sm flex items-center gap-2 mb-1">
                  <FaMapMarkerAlt className="text-text-muted shrink-0" />
                  <span className="truncate">{booking.events?.venue || "Main Auditorium"}</span>
                </p>

                {booking.booked_at && (
                  <p className="text-text-muted text-xs flex items-center gap-2">
                    <FaCalendarAlt className="shrink-0" />
                    Booked on {new Date(booking.booked_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                )}

                <p className="text-accent mt-4 text-xl font-bold">
                  ₹{booking.total_amount}
                </p>

                {booking.qr_code && (
                  <div className="mt-5 flex justify-center bg-white p-3 rounded-xl border border-zinc-200">
                    <img
                      src={booking.qr_code}
                      alt="Ticket QR Code"
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => downloadTicket(booking)}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <FaDownload /> PDF Ticket
                </button>
                <button
                  onClick={() => handleEmailTicket(booking)}
                  disabled={emailingId === booking.id}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  title="Send pass to email"
                >
                  {emailingId === booking.id ? <Spinner size="sm" /> : <FaEnvelope />}
                  Email
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookings