import { useEffect, useState } from "react"
import MemberTable from "../components/members/MemberTable"
import MemberForm from "../components/members/MemberForm"
import MemberProfile from "../components/members/MemberProfile"
import LoginModal from "../components/LoginModal"
import toast from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL

export default function Members() {
  const [members, setMembers] = useState([])
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState(null) // For confirmation modal

  const userRole = localStorage.getItem("role")
  const canEdit = userRole === "Admin" || userRole === "Manager"

  /* ================= FETCH MEMBERS ================= */
  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/members`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch members")
      setMembers(data)
    } catch (err) {
      setError(err.message)
      toast.error(err.message, { duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  /* ================= ADD / EDIT ================= */
  const handleAddOrEdit = member => {
    if (!canEdit) {
      setSelected(member)
      setShowLogin(true)
      return
    }
    setSelected(member)
    setShowForm(true)
  }

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!canEdit || !deleteId) {
      setShowLogin(true)
      toast.error("Login required to delete member", { duration: 3000 })
      setDeleteId(null)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/members/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setMembers(prev => prev.filter(m => m._id !== deleteId))
      toast.success("Member deleted successfully ✅", { duration: 3000 })
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message, { duration: 3000 })
      setDeleteId(null)
    }
  }

  /* ================= LOGIN SUCCESS ================= */
  const onLogin = role => {
    localStorage.setItem("role", role)
    setShowLogin(false)
    if (selected !== null) setShowForm(true)
    toast.success(`Logged in as ${role}`, { duration: 3000 })
  }

  return (
    <section className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">👥 Member Management</h1>

        <button
          onClick={() => handleAddOrEdit(null)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-sm transition"
        >
          + Add Member
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading members...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && (
        <div className="overflow-x-auto">
          <MemberTable
            members={members}
            currentUserRole={userRole}
            onView={setSelected}
            onEdit={handleAddOrEdit}
            onDelete={id => setDeleteId(id)}
          />
        </div>
      )}

      {/* VIEW PROFILE */}
      {selected && !showForm && (
        <MemberProfile
          member={selected}
          isAdmin={canEdit}
          onClose={() => setSelected(null)}
        />
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <MemberForm
            selected={selected}
            onSuccess={fetchMembers}
            onClose={() => {
              setShowForm(false)
              setSelected(null)
            }}
          />
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLogin && (
        <LoginModal
          onLogin={onLogin}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4 max-w-xs w-full">
            <p className="text-gray-700 text-center font-medium">
              Are you sure you want to delete this member?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
