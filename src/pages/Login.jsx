import { useState } from "react"
import { supabase } from "../services/supabase"
import { useNavigate, Link } from "react-router-dom"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { useToast } from "../context/ToastContext"
import { useRateLimit } from "../hooks/useRateLimit"
const Login = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const { isAllowed, getRetryAfterSeconds } = useRateLimit(5, 60000)
  const handleLogin = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    if (!isAllowed()) {
      const seconds = getRetryAfterSeconds()
      setFieldErrors({ form: `Too many login attempts. Please wait ${seconds} seconds and try again.` })
      return
    }
    const errors = {}
    if (!email.trim()) errors.email = "Email is required"
    if (!password) errors.password = "Password is required"

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const loginPromise = supabase.auth.signInWithPassword({ email, password })
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), 4000)
      )

      const { error } = await Promise.race([loginPromise, timeoutPromise])

      if (error) {
        setFieldErrors({ form: error.message })
      } else {
        showToast("Welcome back!")
        navigate("/")
      }
    } catch (err) {
      const isNetwork = err.message?.includes("Failed to fetch") || err.message?.includes("timed out")
      const message = isNetwork
        ? "Unable to reach database (Supabase project is paused/inactive). Please restore your project in the Supabase dashboard."
        : err.message
      setFieldErrors({ form: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex justify-center items-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-surface border border-border p-10 rounded-xl w-full max-w-[400px] space-y-5"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-text-secondary text-sm mt-1">Log in to continue to EventAI</p>
        </div>

        {fieldErrors.form && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
            {fieldErrors.form}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Logging in..." : "Login"}
        </Button>

        <p className="text-center text-text-secondary text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:underline font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login