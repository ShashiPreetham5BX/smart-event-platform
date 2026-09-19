
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const OrganizerRoute = ({ children }) => {

  const { user, role, loading } = useAuth()

  // Wait until authentication and role are loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  // User not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but not an organizer
  if (role !== "organizer") {
    return <Navigate to="/" replace />
  }

  return children
}

export default OrganizerRoute

