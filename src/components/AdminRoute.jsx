import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const AdminRoute = ({ children }) => {
    const { user, role, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg text-text-primary">
                Loading...
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (role !== "admin") {
        return <Navigate to="/" replace />
    }

    return children
}

export default AdminRoute