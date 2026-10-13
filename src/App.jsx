import { lazy, Suspense } from "react"
import { Routes, Route, useLocation } from "react-router-dom"

import Navbar from "./components/Navbar"
import OrganizerRoute from "./components/OrganizerRoute"
import AdminRoute from "./components/AdminRoute"
import ProtectedRoute from "./components/ProtectedRoute"
import Spinner from "./components/ui/Spinner"

const Home = lazy(() => import("./pages/Home"))
const Events = lazy(() => import("./pages/Events"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const CheckIn = lazy(() => import("./pages/CheckIn"))
const EventDetails = lazy(() => import("./pages/EventDetails"))
const Profile = lazy(() => import("./pages/Profile"))
const AdminPanel = lazy(() => import("./pages/AdminPanel"))
const AIChat = lazy(() => import("./pages/AIChat"))
const Bookings = lazy(() => import("./pages/Bookings"))

function App() {
  const location = useLocation()

  return (
    <div>
      <Navbar />

      <div key={location.pathname} className="page-transition">
        <Suspense
          fallback={
            <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" label="Loading page" />
              <p className="text-text-muted text-sm animate-pulse">Loading experience...</p>
            </div>
          }
        >
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
            <Route path="*" element={<div className="text-white p-10 text-center">Page not found</div>} />
          </Routes>
        </Suspense>
      </div>
    </div>
  )
}

export default App