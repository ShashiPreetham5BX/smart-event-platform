import { useState } from "react"
import { supabase } from "../services/supabase"

const Register = () => {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async (e) => {

    e.preventDefault()

    // CREATE AUTH USER

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    if (error) {
      alert(error.message)
      return
    }

    // SAVE USER IN DATABASE

    const user = data.user

    await supabase
      .from("users")
      .insert([
        {
          full_name: name,
          email: email,
          role: "attendee"
        }
      ])

    alert("Registration Successful")
  }

  return (

    <div className="min-h-screen bg-black text-white flex justify-center items-center">

      <form
        onSubmit={handleRegister}
        className="bg-zinc-900 p-10 rounded-2xl w-[400px] space-y-6"
      >

        <h1 className="text-4xl font-bold text-center">
          Register
        </h1>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 outline-none"
        />

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
          Register
        </button>

      </form>

    </div>
  )
}

export default Register