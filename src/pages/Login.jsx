import { useState } from "react"
import { supabase } from "../services/supabase"
import { useNavigate } from "react-router-dom"

const Login = () => {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {

    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert(error.message)
    }
    else {

      alert("Login Successful")

      navigate("/dashboard")
    }
  }

  return (

    <div className="min-h-screen bg-black text-white flex justify-center items-center">

      <form
        onSubmit={handleLogin}
        className="bg-zinc-900 p-10 rounded-2xl w-[400px] space-y-6"
      >

        <h1 className="text-4xl font-bold text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 outline-none"
        />

        <button
          className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl"
        >
          Login
        </button>

      </form>

    </div>
  )
}

export default Login