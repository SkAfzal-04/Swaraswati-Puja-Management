import { useState, useEffect } from "react"
import toast from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL

export default function MemberForm({ selected = null, onSuccess, onClose }) {
  const [member, setMember] = useState({
    name: "",
    role: "User",
    position: "",
    aadhaar: "",
    phone: "",
    active: true,
    contribution: "",
    userId: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (selected) {
      setMember({
        name: selected.name || "",
        role: selected.role || "User",
        position: selected.position || "",
        aadhaar: selected.aadhaar || "",
        phone: selected.phone || "",
        active: selected.active ?? true,
        contribution: selected.contribution ?? "",
        userId: selected.userId || "",
        password: ""
      })
    }
  }, [selected])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setMember(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const submit = async e => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Login required")

      const payload = {
        ...member,
        contribution: member.contribution === "" ? null : Number(member.contribution)
      }

      if (member.role !== "Manager") {
        delete payload.userId
        delete payload.password
      }

      const url = selected ? `${API_URL}/members/${selected._id}` : `${API_URL}/members`
      const method = selected ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Something went wrong")

      toast.success(selected ? "Member updated successfully ✅" : "Member added successfully ✅", { duration: 3000 })
      onSuccess && typeof onSuccess === "function" && onSuccess()
      onClose && typeof onClose === "function" && onClose()
    } catch (err) {
      setError(err.message)
      toast.error(err.message, { duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-orange-100 via-yellow-50 to-orange-50 p-6 rounded-2xl shadow-2xl w-full max-w-xl border border-orange-300">
      <h3 className="text-2xl font-extrabold mb-5 text-center text-orange-600">
        {selected ? "Edit Member" : "Add Member"}
      </h3>

      {error && <p className="text-red-600 text-center mb-3 font-medium">{error}</p>}

      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <input
          name="name"
          placeholder="Name"
          value={member.name}
          onChange={handleChange}
          required
          className="border border-orange-300 focus:ring-2 focus:ring-orange-400 focus:outline-none px-3 py-2 rounded-lg shadow-sm"
        />

        <input
          name="position"
          placeholder="Position"
          value={member.position}
          onChange={handleChange}
          className="border border-orange-300 focus:ring-2 focus:ring-orange-400 focus:outline-none px-3 py-2 rounded-lg shadow-sm"
        />

        <select
          name="role"
          value={member.role}
          onChange={handleChange}
          className="border border-orange-300 focus:ring-2 focus:ring-orange-400 focus:outline-none px-3 py-2 rounded-lg shadow-sm bg-white"
        >
          <option>User</option>
          <option>Manager</option>
          <option>Admin</option>
        </select>

        <input
          name="phone"
          placeholder="Phone"
          value={member.phone}
          onChange={handleChange}
          className="border border-orange-300 focus:ring-2 focus:ring-orange-400 focus:outline-none px-3 py-2 rounded-lg shadow-sm"
        />

        <input
          name="aadhaar"
          placeholder="Aadhaar"
          value={member.aadhaar}
          onChange={handleChange}
          className="border border-orange-300 focus:ring-2 focus:ring-orange-400 focus:outline-none px-3 py-2 rounded-lg shadow-sm"
        />

        <input
          type="number"
          name="contribution"
          placeholder="Contribution (optional)"
          value={member.contribution}
          onChange={handleChange}
          className="border border-orange-300 focus:ring-2 focus:ring-orange-400 focus:outline-none px-3 py-2 rounded-lg shadow-sm"
        />

        <label className="flex items-center gap-2 col-span-2 text-orange-700 font-medium">
          <input
            type="checkbox"
            name="active"
            checked={member.active}
            onChange={handleChange}
            className="accent-orange-500 w-5 h-5"
          />
          Active Member
        </label>

        {!selected && member.role === "Manager" && (
          <>
            <input
              name="userId"
              placeholder="Login User ID"
              value={member.userId}
              onChange={handleChange}
              required
              className="border border-orange-300 focus:ring-2 focus:ring-orange-400 focus:outline-none px-3 py-2 rounded-lg shadow-sm"
            />
            <input
              type="password"
              name="password"
              placeholder="Login Password"
              value={member.password}
              onChange={handleChange}
              required
              className="border border-orange-300 focus:ring-2 focus:ring-orange-400 focus:outline-none px-3 py-2 rounded-lg shadow-sm"
            />
          </>
        )}


        <div className="col-span-2 flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={() => onClose && typeof onClose === "function" && onClose()}
            className="bg-gray-300 hover:bg-gray-400 transition px-5 py-2 rounded-lg shadow"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg shadow transition"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}
