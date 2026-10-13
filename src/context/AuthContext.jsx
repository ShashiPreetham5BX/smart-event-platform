import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../services/supabase"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = async (currentUser) => {
    if (!currentUser) {
      setRole(null)
      return
    }

    // Fast-path: immediate role from metadata so UI is never blocked
    const metaRole = currentUser.user_metadata?.role
    if (metaRole) {
      setRole(metaRole)
    }

    try {
      const rolePromise = supabase
        .from("users")
        .select("role")
        .eq("id", currentUser.id)
        .single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 1500)
      )

      const { data: userData, error } = await Promise.race([rolePromise, timeoutPromise])

      if (!error && userData?.role) {
        setRole(userData.role)
      } else if (!metaRole) {
        setRole("attendee")
      }
    } catch {
      // If table query times out or fails, gracefully fallback
      if (!metaRole) {
        setRole("attendee")
      }
    }
  }

  useEffect(() => {
    let mounted = true

    // 1. Initial quick session check from local cache
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser?.user_metadata?.role) {
          setRole(currentUser.user_metadata.role)
        }
        setLoading(false)
        if (currentUser) {
          fetchRole(currentUser)
        }
      })
      .catch((err) => {
        console.warn("Local auth session check failed:", err.message)
        if (mounted) setLoading(false)
      })

    // 2. Listen to ongoing auth events
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser?.user_metadata?.role) {
        setRole(currentUser.user_metadata.role)
      }
      setLoading(false)
      if (currentUser) {
        await fetchRole(currentUser)
      }
    })

    // 3. Resilient safety net: NEVER block UI for more than 1.5 seconds!
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false)
      }
    }, 1500)

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)