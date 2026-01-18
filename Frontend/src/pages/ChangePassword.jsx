import { useState } from "react"

const API_URL = import.meta.env.VITE_API_URL

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const submit = async e => {
    e.preventDefault()
    setMsg("")
    setError("")

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
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>

      {msg && <p className="text-green-600">{msg}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <button className="w-full bg-orange-500 text-white py-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  )
}
