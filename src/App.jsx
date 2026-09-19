import { Routes, Route, useLocation } from "react-router-dom"

import Home from "./pages/Home"
import Events from "./pages/Events"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import OrganizerRoute from "./components/OrganizerRoute"
import AdminRoute from "./components/AdminRoute"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import EventDetails from "./pages/EventDetails"
import Profile from "./pages/Profile"
import AdminPanel from "./pages/AdminPanel"
import AIChat from "./pages/AIChat"
import Bookings from "./pages/Bookings"
import CheckIn from "./pages/CheckIn"
function App() {
  const location = useLocation()

  return (
    <div>
      <Navbar />

      <div key={location.pathname} className="page-transition">
        <Routes>

          <Route path="/" element={<Home />} />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <OrganizerRoute>
                <Dashboard />
              </OrganizerRoute>
            }
          />
          <Route
            path="/check-in"
            element={
              <OrganizerRoute>
                <CheckIn />
              </OrganizerRoute>
            }
          />
          <Route
            path="/events/:eventId"
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route
            path="/ai-chat"
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div className="text-white p-10">Page not found</div>} />

        </Routes>
      </div>

    </div>
  )
}

export default App