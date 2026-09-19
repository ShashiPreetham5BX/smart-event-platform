
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children }) => {

  const { user, loading } = useAuth()

  // Wait until authentication state is resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

