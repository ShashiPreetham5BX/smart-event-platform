import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-zinc-900 border-b border-zinc-800">
      
      <h1 className="text-2xl font-bold text-blue-400">
        EventAI
      </h1>

      <div className="flex gap-6 text-lg">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/bookings">Bookings</Link>
      </div>
    </nav>
  )
}

export default Navbar