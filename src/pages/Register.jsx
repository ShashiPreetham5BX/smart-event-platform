import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { useToast } from "../context/ToastContext"
import * as Sentry from "@sentry/react"
import { useRateLimit } from "../hooks/useRateLimit"
const Register = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("attendee")
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const { isAllowed, getRetryAfterSeconds } = useRateLimit(3, 60000) // 3 attempts per minute
  const handleRegister = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    if (!isAllowed()) {
      const seconds = getRetryAfterSeconds()
      setFieldErrors({ form: `Too many attempts. Please wait ${seconds} seconds and try again.` })
      return
    }
    const errors = {}
    if (!name.trim()) errors.name = "Full name is required"
    if (!email.trim()) errors.email = "Email is required"
    if (password.length < 6) errors.password = "Password must be at least 6 characters"

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role } }
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), 4000)
      )

      const { error } = await Promise.race([signUpPromise, timeoutPromise])

      if (error) {
        setFieldErrors({ form: error.message })
        return
      }

      showToast("Account created! Welcome to EventAI.")
      navigate("/")
    } catch (err) {
      Sentry.captureException(err)
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
        onSubmit={handleRegister}
        className="bg-surface border border-border p-10 rounded-xl w-full max-w-[400px] space-y-5"
      >
        <div>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-text-secondary text-sm mt-1">Start discovering and booking events</p>
        </div>

        {fieldErrors.form && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
            {fieldErrors.form}
          </div>
        )}

        <Input
          label="Full Name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />

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
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            I am registering as a...
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("attendee")}
              className={`py-3 rounded-lg font-medium text-sm transition-colors ${role === "attendee"
                ? "bg-accent text-white"
                : "bg-bg border border-border text-text-secondary hover:border-zinc-700"
                }`}
            >
              Attendee
            </button>
            <button
              type="button"
              onClick={() => setRole("organizer")}
              className={`py-3 rounded-lg font-medium text-sm transition-colors ${role === "organizer"
                ? "bg-accent text-white"
                : "bg-bg border border-border text-text-secondary hover:border-zinc-700"
                }`}
            >
              Organizer
            </button>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating account..." : "Register"}
        </Button>

        <p className="text-center text-text-secondary text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register