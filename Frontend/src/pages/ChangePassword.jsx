import { useState } from "react"
import { useNavigate } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate() // React Router navigation

  const submit = async e => {
    e.preventDefault()
    setMsg("")
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setMsg("✅ Password updated successfully")
      setOldPassword("")
      setNewPassword("")

      // Navigate to home after 2 seconds
      setTimeout(() => navigate("/"), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-orange-200 via-yellow-100 to-orange-50 border border-orange-300">
      <h2 className="text-3xl font-extrabold mb-6 text-orange-600 text-center drop-shadow-md">
        🔑 Change Password
      </h2>

      {msg && <p className="text-green-700 font-medium mb-3 text-center animate-fade">{msg}</p>}
      {error && <p className="text-red-600 font-medium mb-3 text-center animate-shake">{error}</p>}

      <form onSubmit={submit} className="space-y-4">
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          className="w-full p-3 rounded-xl border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-300 transition"
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full p-3 rounded-xl border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-300 transition"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 hover:shadow-lg text-white py-3 rounded-xl font-semibold transition transform hover:-translate-y-1 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {/* Close button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full mt-2 bg-gray-300 hover:bg-gray-400 hover:shadow-lg text-gray-800 py-3 rounded-xl font-semibold transition transform hover:-translate-y-1"
        >
          Close
        </button>
      </form>
    </div>
  )
}
