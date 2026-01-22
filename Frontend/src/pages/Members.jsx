import { useEffect, useState } from "react"
import MemberTable from "../components/members/MemberTable"
import MemberForm from "../components/members/MemberForm"
import MemberProfile from "../components/members/MemberProfile"
import LoginModal from "../components/LoginModal"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL

export default function Members() {
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null) // For viewing profile
  const [editingMember, setEditingMember] = useState(null) // For add/edit form
  const [showForm, setShowForm] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState(null)

  const { role, isAuthenticated, token } = useAuth()
  const canEdit = role === "Admin" || role === "Manager"

  /* ================= FETCH MEMBERS ================= */
  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/members`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch members")
      setMembers(data)
      setError("")
    } catch (err) {
      setError(err.message)
      setMembers([])
      toast.error(err.message, { duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  /* ================= TOTAL MEMBER COLLECTION ================= */
  const totalMemberCollection = members.reduce(
    (sum, member) => sum + (member.contribution || 0),
    0
  )

  /* ================= ADD / EDIT ================= */
  const handleAddOrEdit = (member) => {
    if (!canEdit) {
      setEditingMember(member)
      setShowLogin(true)
      return
    }
    setEditingMember(member)
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
      const res = await fetch(`${API_URL}/members/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to delete member")

      setMembers((prev) => prev.filter((m) => m._id !== deleteId))
      toast.success("Member deleted successfully ✅", { duration: 3000 })
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message, { duration: 3000 })
      setDeleteId(null)
    }
  }

  return (
    <section className="p-4 sm:p-8 space-y-6 bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-4xl font-extrabold text-orange-600 drop-shadow-md">
          👥 Member Management
        </h1>

        <button
          onClick={() => handleAddOrEdit(null)}
          className="bg-orange-500 hover:bg-orange-600 hover:shadow-lg transition-all duration-200 text-white font-semibold px-5 py-2 rounded-xl shadow-md transform hover:-translate-y-1"
        >
          + Add Member
        </button>
      </div>

      {/* ================= TOTAL MEMBER COLLECTION ================= */}
      {!loading && members.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-orange-200 text-orange-700 font-semibold text-lg w-fit">
          💰 Total Member Collection: ₹{totalMemberCollection.toLocaleString()}
        </div>
      )}

      {/* ================= MEMBER TABLE WITH SKELETON ================= */}
      <div className="overflow-x-auto bg-white p-4 rounded-2xl shadow-lg border border-orange-200 hover:shadow-2xl transition-all duration-200
          scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
        <MemberTable
          members={members}
          currentUserRole={role}
          onView={setSelectedMember}
          onEdit={handleAddOrEdit}
          onDelete={(id) => setDeleteId(id)}
          loading={loading} // ✅ Pass loading to trigger skeleton
        />
      </div>

      {/* ================= NO MEMBERS FOUND ================= */}
      {!loading && members.length === 0 && (
        <p className="text-gray-500 italic text-center">No members found</p>
      )}

      {/* ================= VIEW PROFILE ================= */}
      {selectedMember && !showForm && (
        <MemberProfile
          member={selectedMember}
          isAdmin={canEdit}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* ================= ADD / EDIT FORM ================= */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <MemberForm
            selected={editingMember}
            onSuccess={() => {
              fetchMembers()        // 🔥 refetch members
              setSelectedMember(null) // 🔥 clear stale profile
            }}
            onClose={() => {
              setShowForm(false)
              setEditingMember(null)
            }}
          />
        </div>
      )}

      {/* ================= LOGIN MODAL ================= */}
      {showLogin && (
        <LoginModal
          onClose={() => {
            setShowLogin(false)
            if (editingMember !== null) setShowForm(true)
          }}
        />
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-4 max-w-xs w-full border border-red-300">
            <p className="text-red-700 text-center font-semibold">
              Are you sure you want to delete this member?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 hover:shadow-lg transition px-5 py-2 rounded-xl text-white font-semibold transform hover:-translate-y-1"
              >
                Yes
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-300 hover:bg-gray-400 hover:shadow-lg transition px-5 py-2 rounded-xl font-semibold transform hover:-translate-y-1"
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
