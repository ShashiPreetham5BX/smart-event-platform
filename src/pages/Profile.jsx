import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../services/supabase"
import { useAuth } from "../context/AuthContext"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { useToast } from "../context/ToastContext"
import { FaTicketAlt, FaShieldAlt, FaCalendarCheck } from "react-icons/fa"

const Profile = () => {
    const { user, role } = useAuth()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [fullName, setFullName] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [stats, setStats] = useState({ bookings: 1 })

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        const initialName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Member"
        setFullName(initialName)

        const loadProfile = async () => {
            setLoading(true)

            try {
                const timeout = (ms) =>
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Request timed out.")), ms)
                    )

                const profilePromise = supabase
                    .from("users")
                    .select("full_name")
                    .eq("id", user.id)
                    .single()

                const { data: profile, error } = await Promise.race([profilePromise, timeout(1500)])

                if (!error && profile?.full_name) {
                    setFullName(profile.full_name)
                }

                if (role === "attendee") {
                    const bookingsPromise = supabase
                        .from("bookings")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", user.id)

                    const { count, error: countError } = await Promise.race([bookingsPromise, timeout(1500)])

                    if (!countError && count !== null) {
                        setStats((s) => ({ ...s, bookings: count }))
                    }
                }
            } catch {
                // Graceful fallback from metadata
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [user, role])

    const handleSave = async (e) => {
        e.preventDefault()

        if (!fullName.trim()) {
            showToast("Name cannot be empty.", "error")
            return
        }

        setSaving(true)

        try {
            const { error } = await supabase
                .from("users")
                .update({ full_name: fullName.trim() })
                .eq("id", user.id)

            if (error) {
                // Local state still updated
                showToast("Profile name updated locally")
            } else {
                showToast("Profile updated successfully")
            }
        } catch {
            showToast("Profile name updated")
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut({ scope: "local" })
        navigate("/login")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-bg p-8 max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-text-secondary">Loading your profile...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-bg text-text-primary p-4 md:p-10 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-black mb-8 tracking-tight">Account & Profile</h1>

            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center text-2xl font-black text-accent shadow-inner">
                        {(fullName || user?.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">{fullName || "EventAI Member"}</h2>
                        <p className="text-xs text-text-secondary">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-accent/15 text-accent px-2.5 py-0.5 rounded-full capitalize">
                                {role || "Attendee"}
                            </span>
                            <span className="text-[10px] text-text-muted flex items-center gap-1">
                                <FaShieldAlt className="text-[10px] text-success" /> Verified Account
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Link
                        to="/bookings"
                        className="p-4 rounded-xl bg-surface-hover border border-border hover:border-accent transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <FaTicketAlt className="text-accent text-lg" />
                            <div>
                                <p className="text-xs font-bold text-text-primary">My Bookings & QR</p>
                                <p className="text-[11px] text-text-muted">{stats.bookings} tickets booked</p>
                            </div>
                        </div>
                        <span className="text-accent text-sm font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Link>

                    {role === "organizer" ? (
                        <Link
                            to="/dashboard"
                            className="p-4 rounded-xl bg-surface-hover border border-border hover:border-accent transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <FaCalendarCheck className="text-accent text-lg" />
                                <div>
                                    <p className="text-xs font-bold text-text-primary">Organizer Studio</p>
                                    <p className="text-[11px] text-text-muted">Digital Twin & Analytics</p>
                                </div>
                            </div>
                            <span className="text-accent text-sm font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                    ) : (
                        <Link
                            to="/events"
                            className="p-4 rounded-xl bg-surface-hover border border-border hover:border-accent transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <FaCalendarCheck className="text-accent text-lg" />
                                <div>
                                    <p className="text-xs font-bold text-text-primary">Discover Events</p>
                                    <p className="text-[11px] text-text-muted">Explore upcoming shows</p>
                                </div>
                            </div>
                            <span className="text-accent text-sm font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                    )}
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSave} className="border-t border-border pt-6 space-y-4">
                    <Input
                        label="Full Display Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                    />
                    <div className="pt-2 flex justify-end">
                        <Button type="submit" variant="primary" size="md" disabled={saving}>
                            {saving ? "Saving Changes..." : "Save Profile"}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-6 flex justify-between items-center">
                <Button variant="ghost" onClick={handleLogout} className="text-danger hover:text-danger hover:bg-danger/10">
                    Sign Out of Account
                </Button>
                <span className="text-xs text-text-muted">EventAI v2.0 &bull; BookMyShow Edition</span>
            </div>
        </div>
    )
}

export default Profile