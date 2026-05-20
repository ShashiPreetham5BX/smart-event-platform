import { useEffect, useState } from "react"

import {
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave
} from "react-icons/fa"

import { supabase } from "../services/supabase"

const Dashboard = () => {

  // STATES

  const [totalEvents, setTotalEvents] = useState(0)

  const [totalBookings, setTotalBookings] = useState(0)

  const [totalRevenue, setTotalRevenue] = useState(0)

  // FETCH DASHBOARD DATA

  const fetchDashboardData = async () => {

    // FETCH EVENTS

    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")

    if (eventsError) {
      console.log(eventsError)
    } else {
      setTotalEvents(eventsData.length)
    }

    // FETCH BOOKINGS

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")

    if (bookingsError) {
      console.log(bookingsError)
    } else {

      setTotalBookings(bookingsData.length)

      // CALCULATE REVENUE

      const revenue = bookingsData.reduce(
        (total, booking) =>
          total + Number(booking.total_amount || 0),
        0
      )

      setTotalRevenue(revenue)
    }
  }

  // LOAD DATA ON PAGE OPEN

  useEffect(() => {
    fetchDashboardData()
  }, [])
const handleLogout = async () => {

  await supabase.auth.signOut()

  window.location.href = "/login"
}
  return (

    <div className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}

      <div className="w-64 bg-zinc-900 p-6 border-r border-zinc-800">

        <h1 className="text-3xl font-bold text-blue-400 mb-10">
          EventAI
        </h1>

        <div className="space-y-6 text-lg">

          <p className="hover:text-blue-400 cursor-pointer">
            Dashboard
          </p>

          <p className="hover:text-blue-400 cursor-pointer">
            Events
          </p>

          <p className="hover:text-blue-400 cursor-pointer">
            Bookings
          </p>

          <p className="hover:text-blue-400 cursor-pointer">
            Analytics
          </p>
          <button
  onClick={handleLogout}
  className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl mt-10"
>
  Logout
</button>
        </div>

      </div>

      {/* MAIN CONTENT */}

      <div className="flex-1 p-10">

        <h1 className="text-5xl font-bold mb-10">
          Organizer Dashboard
        </h1>

        {/* STATS CARDS */}

        <div className="grid md:grid-cols-3 gap-8">

          {/* TOTAL EVENTS */}

          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">

            <FaCalendarAlt className="text-4xl text-blue-400 mb-4" />

            <h2 className="text-2xl font-bold">
              Total Events
            </h2>

            <p className="text-5xl mt-4 font-bold">
              {totalEvents}
            </p>

          </div>

          {/* TOTAL BOOKINGS */}

          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">

            <FaUsers className="text-4xl text-green-400 mb-4" />

            <h2 className="text-2xl font-bold">
              Total Bookings
            </h2>

            <p className="text-5xl mt-4 font-bold">
              {totalBookings}
            </p>

          </div>

          {/* TOTAL REVENUE */}

          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">

            <FaMoneyBillWave className="text-4xl text-yellow-400 mb-4" />

            <h2 className="text-2xl font-bold">
              Revenue
            </h2>

            <p className="text-5xl mt-4 font-bold">
              ₹ {totalRevenue}
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard