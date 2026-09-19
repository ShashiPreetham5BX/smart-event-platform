import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FaCalendarAlt, FaUsers, FaMoneyBillWave } from "react-icons/fa"
import DashboardLayout from "../layouts/DashboardLayout"
import StatCard from "../components/ui/StatCard"
import { supabase } from "../services/supabase"
import { useExport } from "../hooks/useExport"
import { useToast } from "../context/ToastContext"
import { useEvents } from "../hooks/useEvents"
import PricingAssistant from "../components/ui/PricingAssistant"
const Dashboard = () => {
  const [totalEvents, setTotalEvents] = useState(0)
  const [totalBookings, setTotalBookings] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const { exportBookings } = useExport()
  const { showToast } = useToast()
  const [exporting, setExporting] = useState(false)
  const { user } = useAuth()
  const { events: allRecentEvents, loading: eventsLoading } = useEvents({ page: 1 })
  const myEvents = allRecentEvents.filter((e) => e.organizer_id === user?.id)
  const handleExportAll = async () => {
    setExporting(true)
    const result = await exportBookings()
    setExporting(false)

    if (!result.success) {
      showToast(result.error, "error")
    } else {
      showToast("Export downloaded")
    }
  }
  const fetchDashboardData = async () => {
    setLoading(true)

    const { count: eventsCount, error: eventsError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })

    if (eventsError) {
      console.error(eventsError)
    } else {
      setTotalEvents(eventsCount ?? 0)
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")

    if (bookingsError) {
      console.error(bookingsError)
    } else {
      setTotalBookings(bookingsData.length)
      const revenue = bookingsData.reduce(
        (total, booking) => total + Number(booking.total_amount || 0),
        0
      )
      setTotalRevenue(revenue)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <DashboardLayout><div className="mb-10 flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-4xl font-bold text-text-primary">Organizer Dashboard</h1>
        <p className="text-text-secondary mt-1">An overview of your events and bookings.</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/check-in"
          className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Open Check-In Scanner
        </Link>
        <button
          onClick={handleExportAll}
          disabled={exporting}
          className="bg-surface border border-border hover:bg-surface-hover disabled:opacity-50 text-text-primary px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {exporting ? "Exporting..." : "Export All Bookings (CSV)"}
        </button>
      </div>
    </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 h-40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard icon={FaCalendarAlt} label="Total Events" value={totalEvents} />
          <StatCard icon={FaUsers} label="Total Bookings" value={totalBookings} />
          <StatCard icon={FaMoneyBillWave} label="Revenue" value={`₹${totalRevenue}`} accent />
        </div>
      )}

      <div className="mt-14">
        <h2 className="text-2xl font-bold mb-6">Pricing Insights</h2>

        {eventsLoading ? (
          <div className="bg-surface border border-border rounded-xl h-24 animate-pulse" />
        ) : myEvents.length === 0 ? (
          <p className="text-text-secondary text-sm">No events yet.</p>
        ) : (
          <div className="space-y-4">
            {myEvents.map((event) => (
              <div key={event.id} className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-3">{event.title}</h3>
                <PricingAssistant eventId={event.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard