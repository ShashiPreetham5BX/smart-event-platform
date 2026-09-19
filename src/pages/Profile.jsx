import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import { useAuth } from "../context/AuthContext"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { useToast } from "../context/ToastContext"

const Profile = () => {
    const { user, role } = useAuth()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [fullName, setFullName] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [stats, setStats] = useState({ bookings: 0 })

    useEffect(() => {
        if (!user) return

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

                const { data: profile, error } = await Promise.race([profilePromise, timeout(10000)])

                if (error) {
                    console.error("Profile fetch failed:", error.message)
                } else if (profile) {
                    setFullName(profile.full_name || "")
                }

                if (role === "attendee") {
                    const bookingsPromise = supabase
                        .from("bookings")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", user.id)

                    const { count, error: countError } = await Promise.race([bookingsPromise, timeout(10000)])

                    if (countError) {
                        console.error("Booking count fetch failed:", countError.message)
                    } else {
                        setStats((s) => ({ ...s, bookings: count ?? 0 }))
                    }
                }
            } catch (err) {
                console.error("Unexpected error loading profile:", err.message)
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [user, role])

    const handleSave = async (e) => {
        e.preventDefault()

        if (!fullName.trim()) {
            showToast("Name can't be empty.", "error")
            return
        }

        setSaving(true)

        const { error } = await supabase
            .from("users")
            .update({ full_name: fullName })
            .eq("id", user.id)

        setSaving(false)

        if (error) {
            showToast(error.message, "error")
        } else {
            showToast("Profile updated")
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut({ scope: "local" })
        navigate("/login")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-bg p-10 max-w-xl mx-auto">
                <div className="h-10 w-48 bg-surface rounded-lg animate-pulse mb-8" />
                <div className="h-64 bg-surface rounded-xl animate-pulse" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-bg text-text-primary p-6 md:p-10 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="bg-surface border border-border rounded-xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center text-2xl font-bold text-accent">
                        {(fullName || user?.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold">{user?.email}</p>
                        <span className="inline-block mt-1 text-xs font-medium bg-accent-soft text-accent px-2.5 py-1 rounded-full capitalize">
                            {role}
                        </span>
                    </div>
                </div>

                {role === "attendee" && (
                    <div className="border-t border-border pt-6">
                        <span className="text-text-secondary text-sm">Tickets Booked</span>
                        <p className="text-3xl font-bold mt-1">{stats.bookings}</p>
                    </div>
                )}

                <form onSubmit={handleSave} className="border-t border-border pt-6 space-y-4">
                    <Input
                        label="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </div>

            <Button variant="ghost" onClick={handleLogout} className="mt-6">
                Logout
            </Button>
        </div>
    )
}

export default Profile