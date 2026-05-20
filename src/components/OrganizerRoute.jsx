import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const OrganizerRoute = ({ children }) => {

  const { user, role } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  if (role !== "organizer") {
    return <Navigate to="/" />
  }

  return children
}

export default OrganizerRoute