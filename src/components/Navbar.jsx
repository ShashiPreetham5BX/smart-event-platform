import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useCity } from "../context/CityContext"
import { supabase } from "../services/supabase"
import { FaMoon, FaSun, FaMapMarkerAlt, FaSearch, FaUserCircle, FaBars, FaTimes } from "react-icons/fa"
import { useTheme } from "../hooks/useTheme"

const QUICK_CATEGORIES = [
  { label: "All Events", to: "/events", category: "" },
  { label: "Live Music", to: "/events?category=music", category: "music" },
  { label: "Tech & Summits", to: "/events?category=tech", category: "tech" },
  { label: "Business & Networking", to: "/events?category=business", category: "business" },
  { label: "Sports & Fitness", to: "/events?category=sports", category: "sports" },
  { label: "Arts & Culture", to: "/events?category=arts", category: "arts" },
]

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors
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
  const { selectedCity, setSelectedCity, cities } = useCity()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navSearch, setNavSearch] = useState("")
  const [showCityPicker, setShowCityPicker] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: "local" })
    navigate("/login")
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (navSearch.trim()) {
      navigate(`/events?search=${encodeURIComponent(navSearch.trim())}`)
    } else {
      navigate("/events")
    }
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg/80 border-b border-border">
      {/* MAIN TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand + City Selector */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white text-base shadow-sm">
              E
            </span>
            Event<span className="text-accent">AI</span>
          </Link>

          {/* BookMyShow Style City Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowCityPicker((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-zinc-700 text-text-primary transition-all cursor-pointer"
            >
              <FaMapMarkerAlt className="text-accent text-xs" />
              <span>{selectedCity}</span>
              <span className="text-[10px] text-text-muted">▾</span>
            </button>

            {showCityPicker && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-surface border border-border rounded-xl shadow-elevated py-1.5 z-50 animate-in fade-in zoom-in-95">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Popular Cities
                </p>
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city.name)
                      setShowCityPicker(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-surface-hover flex items-center justify-between transition-colors ${
                      selectedCity === city.name ? "text-accent font-bold" : "text-text-primary"
                    }`}
                  >
                    <span>{city.name}</span>
                    {selectedCity === city.name && <span className="text-accent">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Search events, concerts, venues, or activities..."
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </form>

        {/* Right: Nav Actions */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/events">Explore</NavLink>

          {user && (
            <>
              <NavLink to="/bookings">My Tickets</NavLink>
              <NavLink to="/ai-chat">
                <span className="inline-flex items-center gap-1.5">
                  AI Copilot <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-bold">AI</span>
                </span>
              </NavLink>

              {role === "organizer" && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/check-in">Check-In</NavLink>
                </>
              )}

              {role === "admin" && <NavLink to="/admin">Admin</NavLink>}

              <Link
                to="/profile"
                className="ml-1 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                title="Profile"
              >
                <FaUserCircle className="text-lg" />
              </Link>

              <button
                onClick={handleLogout}
                className="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-danger hover:bg-danger/10 transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {!user && (
            <div className="flex items-center gap-2 ml-2">
              <NavLink to="/login">Sign In</NavLink>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-accent hover:bg-accent-hover text-white shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-secondary transition-colors"
          >
            {theme === "dark" ? <FaSun className="text-warning text-sm" /> : <FaMoon className="text-sm" />}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary"
          >
            {theme === "dark" ? <FaSun className="text-warning text-xs" /> : <FaMoon className="text-xs" />}
          </button>
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-border text-text-primary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* SUB-NAV: BOOKMYSHOW STYLE CATEGORY STRIP */}
      <div className="hidden sm:block border-t border-border/60 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-6 overflow-x-auto py-2 scrollbar-none text-xs font-medium text-text-secondary">
          {QUICK_CATEGORIES.map((cat) => {
            const isCurrent =
              location.pathname === "/events" &&
              (location.search.includes(`category=${cat.category}`) || (!cat.category && !location.search.includes("category=")))

            return (
              <Link
                key={cat.label}
                to={cat.to}
                className={`shrink-0 hover:text-accent transition-colors pb-0.5 ${
                  isCurrent ? "text-accent font-bold border-b-2 border-accent" : ""
                }`}
              >
                {cat.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* MOBILE MENU ACCORDION */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-5 pt-3 bg-surface border-t border-border space-y-3">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-border rounded-xl text-xs text-text-primary outline-none"
            />
          </form>

          {/* City selector mobile */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-border text-xs">
            <span className="text-text-muted flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-accent" /> Location:
            </span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-text-primary font-bold outline-none"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.name} className="bg-zinc-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <NavLink to="/" onClick={closeMobile}>Home</NavLink>
            <NavLink to="/events" onClick={closeMobile}>Explore Events</NavLink>

            {user ? (
              <>
                <NavLink to="/bookings" onClick={closeMobile}>My Tickets</NavLink>
                <NavLink to="/ai-chat" onClick={closeMobile}>AI Copilot</NavLink>
                {role === "organizer" && (
                  <>
                    <NavLink to="/dashboard" onClick={closeMobile}>Dashboard</NavLink>
                    <NavLink to="/check-in" onClick={closeMobile}>Check-In Scanner</NavLink>
                  </>
                )}
                {role === "admin" && <NavLink to="/admin" onClick={closeMobile}>Admin Panel</NavLink>}
                <NavLink to="/profile" onClick={closeMobile}>My Profile</NavLink>
                <button
                  onClick={() => {
                    closeMobile()
                    handleLogout()
                  }}
                  className="text-left px-3.5 py-2 rounded-lg text-sm font-semibold text-danger hover:bg-danger/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="w-full text-center py-2.5 rounded-xl border border-border text-xs font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="w-full text-center py-2.5 rounded-xl bg-accent text-white text-xs font-bold shadow-sm"
                >
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar