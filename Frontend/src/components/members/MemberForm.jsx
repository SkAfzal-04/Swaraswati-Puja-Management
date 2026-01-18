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

      // Only include login info if role is Manager
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

      // Safe callback execution
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
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl">
      <h3 className="text-xl font-bold mb-4 text-center">
        {selected ? "Edit Member" : "Add Member"}
      </h3>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <input
          name="name"
          placeholder="Name"
          value={member.name}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <input
          name="position"
          placeholder="Position"
          value={member.position}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <select
          name="role"
          value={member.role}
          onChange={handleChange}
          className="border p-2 rounded"
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
          className="border p-2 rounded"
        />

        <input
          name="aadhaar"
          placeholder="Aadhaar"
          value={member.aadhaar}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="contribution"
          placeholder="Contribution (optional)"
          value={member.contribution}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <label className="flex items-center gap-2 col-span-2">
          <input
            type="checkbox"
            name="active"
            checked={member.active}
            onChange={handleChange}
          />
          Active Member
        </label>

        {/* Manager login fields */}
        {member.role === "Manager" && (
          <>
            <input
              name="userId"
              placeholder="Login User ID"
              value={member.userId}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Login Password"
              value={member.password}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
          </>
        )}

        <div className="col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onClose && typeof onClose === "function" && onClose()}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}
