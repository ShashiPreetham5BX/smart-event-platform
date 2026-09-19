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

    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", currentUser.id)
      .single()

    if (error) {
      console.error("Role fetch failed:", error.message)
      setRole(null)
    } else {
      setRole(userData?.role ?? null)
    }
  }

  useEffect(() => {

    // Safety net: if nothing has resolved within 5 seconds for any reason,
    // stop showing "Loading..." forever and treat the user as logged out.
    const safetyTimeout = setTimeout(() => {
      setLoading((current) => {
        if (current) {
          console.warn("Auth check timed out — clearing local session.")
          supabase.auth.signOut({ scope: "local" })
          setUser(null)
          setRole(null)
        }
        return false
      })
    }, 5000)

    // We rely ONLY on onAuthStateChange, not a separate getSession() call.
    // Supabase fires an "INITIAL_SESSION" event immediately on subscribe,
    // which tells us the current session state without needing a second,
    // redundant request that can hang under certain browser lock conditions.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {

        const currentUser = session?.user ?? null

        setUser(currentUser)

        await fetchRole(currentUser)

        clearTimeout(safetyTimeout)
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(safetyTimeout)
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