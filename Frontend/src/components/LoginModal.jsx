import { useState } from "react"
import { useAuth } from "../context/AuthContext" // ✅ ADD THIS

const API_URL = import.meta.env.VITE_API_URL

export default function LoginModal({ onClose }) {
  const { login } = useAuth() // ✅ CONTEXT LOGIN
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Login failed")

      // ✅ CENTRALIZED AUTH STATE
      login({
        role: data.role,
        token: data.token
      })

      onClose() // close modal after success
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-orange-200 via-yellow-100 to-orange-50 p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-orange-300">
        <h2 className="text-2xl font-extrabold mb-5 text-orange-600 text-center drop-shadow-md">
          🔐 Admin / Manager Login
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="w-full border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-300 p-3 rounded-xl"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-300 p-3 rounded-xl"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 py-3 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}
