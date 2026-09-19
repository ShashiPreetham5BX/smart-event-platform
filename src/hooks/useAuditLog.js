import { useState, useEffect, useCallback } from "react"
import { supabase } from "../services/supabase"
import { useAuth } from "../context/AuthContext"

// Call this from anywhere an action worth tracking happens.
// It's fire-and-forget: logging failures should never block the
// actual action the user is trying to perform.
export const logAction = async (action, entityType, entityId, metadata = {}) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("audit_logs").insert([
        {
            actor_id: user.id,
            action,
            entity_type: entityType,
            entity_id: String(entityId),
            metadata
        }
    ])

    if (error) {
        console.error("Audit log failed (non-blocking):", error.message)
    }
}

// For displaying the log (admin only)
export const useAuditLog = () => {
    const { role } = useAuth()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchLogs = useCallback(async () => {
        if (role !== "admin") {
            setLoading(false)
            return
        }

        setLoading(true)

        const { data, error } = await supabase
            .from("audit_logs")
            .select(`
        *,
        users:actor_id ( full_name, email )
      `)
            .order("created_at", { ascending: false })
            .limit(50)

        if (error) {
            console.error("Failed to load audit logs:", error.message)
        } else {
            setLogs(data || [])
        }

        setLoading(false)
    }, [role])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    return { logs, loading, refetch: fetchLogs }
}