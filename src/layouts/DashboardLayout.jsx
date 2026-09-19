import { Link, useNavigate, useLocation } from "react-router-dom"
import { FaTachometerAlt, FaCalendarAlt, FaTicketAlt, FaChartLine } from "react-icons/fa"
import { supabase } from "../services/supabase"

const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { to: "/events", label: "Events", icon: FaCalendarAlt },
    { to: "/bookings", label: "Bookings", icon: FaTicketAlt },
]

const SidebarLink = ({ to, label, icon: Icon }) => {
    const location = useLocation()
    const isActive = location.pathname === to

    return (
        <Link
            to={to}
            className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
        ${isActive
                    ? "bg-accent-soft text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"}
      `}
        >
            <Icon className="text-base" />
            {label}
        </Link>
    )
}

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut({ scope: "local" })
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-bg flex">

            {/* SIDEBAR */}
            <div className="w-64 shrink-0 bg-surface border-r border-border p-5 flex flex-col">
                <div className="space-y-1 flex-1">
                    {NAV_ITEMS.map((item) => (
                        <SidebarLink key={item.to} {...item} />
                    ))}

                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted cursor-not-allowed" aria-disabled="true">
                        <FaChartLine className="text-base" />
                        Analytics
                        <span className="ml-auto text-[10px] uppercase bg-surface-hover px-1.5 py-0.5 rounded">Soon</span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
                >
                    Logout
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-8 md:p-10">
                {children}
            </div>
        </div>
    )
}

export default DashboardLayout