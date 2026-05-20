import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Events from "./pages/Events"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"

import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import OrganizerRoute from "./components/OrganizerRoute"
import Bookings from "./pages/Bookings"
function App() {

  return (

    <div>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
  path="/events"
  element={
    <OrganizerRoute>

      <Events />

    </OrganizerRoute>
  }
/>
<Route path="/bookings" element={<Bookings />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>
          }
        />

      </Routes>

    </div>
  )
}

export default App