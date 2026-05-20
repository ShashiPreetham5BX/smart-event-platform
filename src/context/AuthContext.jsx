import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../services/supabase"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
const [role, setRole] = useState(null)
  // GET SESSION

  useEffect(() => {

 const getSession = async () => {

  const { data } = await supabase.auth.getSession()

  const currentUser = data.session?.user ?? null

  setUser(currentUser)

  // FETCH ROLE

  if (currentUser) {

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("email", currentUser.email)
      .single()

    setRole(userData?.role)
  }
}

    getSession()

    // LISTEN FOR LOGIN / LOGOUT

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()

  }, [])

  return (
<AuthContext.Provider value={{ user, role }}>
      {children}
    </AuthContext.Provider>

  )
}

export const useAuth = () => useContext(AuthContext)