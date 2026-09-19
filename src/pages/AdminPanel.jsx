import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import Modal from "../components/ui/Modal"
import { useToast } from "../context/ToastContext"
import { logAction, useAuditLog } from "../hooks/useAuditLog"
const AdminPanel = () => {
    const { showToast } = useToast()
    const [users, setUsers] = useState([])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const { logs, loading: logsLoading, refetch: refetchLogs } = useAuditLog()
    const fetchData = async () => {
        setLoading(true)

        const [{ data: usersData, error: usersError }, { data: eventsData, error: eventsError }] =
            await Promise.all([
                supabase.from("users").select("*").order("full_name"),
                supabase.from("events").select("*").order("id", { ascending: false })
            ])

        if (usersError) console.error(usersError)
        if (eventsError) console.error(eventsError)

        setUsers(usersData || [])
        setEvents(eventsData || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleRoleChange = async (targetUser, newRole) => {
        setUpdatingId(targetUser.id)

        const { error } = await supabase
            .from("users")
            .update({ role: newRole })
            .eq("id", targetUser.id)

        setUpdatingId(null)

        if (error) {
            showToast(error.message, "error")
        } else {
            setUsers((prev) =>
                prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
            )
            logAction("role_change", "user", targetUser.id, {
                target_email: targetUser.email,
                from: targetUser.role,
                to: newRole
            })
            showToast(`${targetUser.full_name || targetUser.email} is now ${newRole}`)
            refetchLogs()
        }
    }
    const confirmDeleteEvent = async () => {
        const id = deleteTarget
        setDeleteTarget(null)

        const { error } = await supabase.from("events").delete().eq("id", id)

        if (error) {
            showToast(error.message, "error")
        } else {
            setEvents((prev) => prev.filter((e) => e.id !== id))
            showToast("Event deleted")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-bg p-10">
                <div className="h-10 w-64 bg-surface rounded-lg animate-pulse mb-10" />
                <div className="h-64 bg-surface rounded-xl animate-pulse" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-bg text-text-primary p-6 md:p-10 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-10">Admin Panel</h1>

            <section className="mb-16">
                <h2 className="text-xl font-semibold mb-4">Users <span className="text-text-secondary font-normal">({users.length})</span></h2>

                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg text-text-muted uppercase text-xs tracking-wide">
                            <tr>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-t border-border hover:bg-surface-hover transition-colors">
                                    <td className="p-4">{u.full_name || "—"}</td>
                                    <td className="p-4 text-text-secondary">{u.email}</td>
                                    <td className="p-4">
                                        <select
                                            value={u.role}
                                            disabled={updatingId === u.id}
                                            onChange={(e) => handleRoleChange(u, e.target.value)}
                                            className="bg-bg border border-border rounded-lg px-3 py-1.5 outline-none disabled:opacity-50 focus:ring-2 focus:ring-accent/40"
                                        >
                                            <option value="attendee">attendee</option>
                                            <option value="organizer">organizer</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">All Events <span className="text-text-secondary font-normal">({events.length})</span></h2>

                <div className="grid md:grid-cols-3 gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="bg-surface border border-border rounded-xl p-5">
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-text-secondary text-sm mt-1">{event.venue}</p>
                            <p className="text-accent font-semibold mt-2">₹{event.price}</p>

                            <button
                                onClick={() => setDeleteTarget(event.id)}
                                className="mt-4 text-sm text-danger hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </section>
            <section className="mt-16">
                <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>

                {logsLoading ? (
                    <div className="bg-surface border border-border rounded-xl h-40 animate-pulse" />
                ) : logs.length === 0 ? (
                    <p className="text-text-secondary text-sm">No activity recorded yet.</p>
                ) : (
                    <div className="bg-surface border border-border rounded-xl divide-y divide-border">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-sm">
                                <div>
                                    <p>
                                        <span className="font-medium">{log.users?.full_name || log.users?.email || "Unknown user"}</span>
                                        {" "}
                                        <span className="text-text-secondary">
                                            {log.action === "delete" && `deleted ${log.entity_type} "${log.metadata?.title || log.entity_id}"`}
                                            {log.action === "role_change" && `changed ${log.metadata?.target_email}'s role from ${log.metadata?.from} to ${log.metadata?.to}`}
                                        </span>
                                    </p>
                                </div>
                                <span className="text-text-muted whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            <Modal
                open={deleteTarget !== null}
                title="Delete this event?"
                description="This will permanently remove the event for all users. This cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                onConfirm={confirmDeleteEvent}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    )
}

export default AdminPanel