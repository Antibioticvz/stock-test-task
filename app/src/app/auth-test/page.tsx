"use client"
import { auth } from "@/lib/firebase-config"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"

export default function AuthTestPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setMessage("Login successful! Firebase is configured correctly.")
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Firebase Auth Test</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Login
        </button>
        {message && <p className="mt-4 p-2 bg-gray-100 rounded">{message}</p>}
      </div>
    </div>
  )
}
