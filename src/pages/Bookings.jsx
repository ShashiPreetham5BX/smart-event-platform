import jsPDF from "jspdf"
import { useAuth } from "../context/AuthContext"
import { useBookings } from "../hooks/useBookings"
import EmptyState from "../components/ui/EmptyState"
import Spinner from "../components/ui/Spinner"

const Bookings = () => {
  const { user } = useAuth()
  const { bookings, loading, error } = useBookings()

  const downloadTicket = (booking) => {
    const doc = new jsPDF()

    doc.setFillColor(20, 20, 20)
    doc.rect(0, 0, 210, 35, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text("EVENT TICKET", 20, 22)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.text(`Ticket ID: ${booking.id}`, 20, 50)
    doc.text(`Customer Name: ${user?.email?.split("@")[0]}`, 20, 65)
    doc.text(`Customer Email: ${user?.email}`, 20, 80)
    doc.text(`Event: ${booking.events?.title}`, 20, 95)
    doc.text(`Venue: ${booking.events?.venue}`, 20, 110)
    doc.text(`Ticket Count: ${booking.ticket_count}`, 20, 125)
    doc.text(`Total Amount: ₹ ${booking.total_amount}`, 20, 140)
    doc.text(`Booking Date: ${new Date(booking.booked_at).toLocaleString()}`, 20, 155)

    if (booking.qr_code) {
      doc.addImage(booking.qr_code, "PNG", 120, 55, 60, 60)
    }

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text("Please carry this ticket during event entry.", 20, 190)
    doc.text("Powered by EventAI Platform", 20, 200)

    doc.save(`ticket-${booking.id}.pdf`)
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
      <h1 className="text-4xl font-bold mb-10">My Tickets</h1>

      {bookings.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No tickets yet"
          description="You haven't booked any events. Browse what's happening and grab your first ticket."
          actionLabel="Explore Events"
          actionTo="/events"
        />
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-surface p-6 rounded-xl border border-border"
            >
              <h2 className="text-xl font-bold mb-3">Ticket #{booking.id}</h2>
              <p className="text-text-secondary text-sm">Event: {booking.events?.title}</p>
              <p className="text-text-secondary text-sm mt-1">Venue: {booking.events?.venue}</p>
              <p className="text-accent mt-3 text-lg font-semibold">
                ₹ {booking.total_amount}
              </p>

              {booking.qr_code && (
                <img
                  src={booking.qr_code}
                  alt="QR"
                  className="mt-5 rounded-xl bg-white p-4 w-48"
                />
              )}

              <button
                onClick={() => downloadTicket(booking)}
                className="mt-5 w-full bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookings