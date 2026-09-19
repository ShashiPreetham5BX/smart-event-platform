import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../services/supabase"
import { FaMoon, FaSun } from "react-icons/fa"
import { useTheme } from "../hooks/useTheme"

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? "bg-accent-soft text-accent"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"}
      `}
    >
      {children}
    </Link>
  )
}

const Navbar = () => {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: "local" })
    navigate("/login")
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        <Link to="/" className="text-xl font-bold text-text-primary tracking-tight">
          Event<span className="text-accent">AI</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/">Home</NavLink>

          {user && (
            <>
              <NavLink to="/events">Events</NavLink>
              <NavLink to="/bookings">Bookings</NavLink>{role === "organizer" && <NavLink to="/dashboard">Dashboard</NavLink>}
              {role === "organizer" && <NavLink to="/check-in">Check-In</NavLink>}
              {role === "admin" && <NavLink to="/admin">Admin</NavLink>}
              <NavLink to="/profile">Profile</NavLink>

              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {!user && (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link
                to="/register"
                className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-accent hover:bg-accent-hover text-white transition-colors"
              >
                Register
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="ml-2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors"
          >
            {theme === "dark" ? <FaSun className="text-warning" /> : <FaMoon className="text-text-secondary" />}
          </button>
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-hover"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <div className="space-y-1.5">
            <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-text-primary transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-1 border-t border-border">
          <NavLink to="/" onClick={closeMobile}>Home</NavLink>

          {user && (
            <>
              <NavLink to="/events" onClick={closeMobile}>Events</NavLink>
              <NavLink to="/bookings" onClick={closeMobile}>Bookings</NavLink>
              {role === "organizer" && <NavLink to="/dashboard" onClick={closeMobile}>Dashboard</NavLink>}
              {role === "organizer" && <NavLink to="/check-in" onClick={closeMobile}>Check-In</NavLink>}
              {role === "admin" && <NavLink to="/admin" onClick={closeMobile}>Admin</NavLink>}
              <NavLink to="/profile" onClick={closeMobile}>Profile</NavLink>
              <button
                onClick={() => { closeMobile(); handleLogout() }}
                className="text-left px-4 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger/10"
              >
                Logout
              </button>
            </>
          )}

          {!user && (
            <>
              <NavLink to="/login" onClick={closeMobile}>Login</NavLink>
              <NavLink to="/register" onClick={closeMobile}>Register</NavLink>
            </>
          )}

          <button
            onClick={() => { closeMobile(); toggleTheme() }}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-hover text-left"
          >
            {theme === "dark" ? <FaSun className="text-warning" /> : <FaMoon />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar