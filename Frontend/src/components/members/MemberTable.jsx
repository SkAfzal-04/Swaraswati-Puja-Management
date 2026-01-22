import { useState, useMemo } from "react"

/* =========================
   SKELETON LOADER
========================= */
function TableSkeleton({ rows = 5, columns = 8 }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4 animate-pulse">
      <table className="min-w-[700px] w-full text-sm sm:text-base">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th
                key={i}
                className="p-3 bg-orange-400 rounded mb-2"
              >
                <div className="h-4 w-24 bg-orange-300 rounded mx-auto" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b">
              {Array.from({ length: columns }).map((_, j) => (
                <td
                  key={j}
                  className="p-3"
                >
                  <div
                    className={`h-4 bg-gray-200 rounded ${
                      j % 2 === 0 ? "w-3/4" : "w-1/2"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* =========================
   MAIN COMPONENT
========================= */
export default function MemberTable({
  members,
  currentUserRole,
  onView,
  onEdit,
  onDelete,
  loading = false, // new prop to trigger skeleton
}) {
  const canEdit = currentUserRole === "Admin" || currentUserRole === "Manager"

  const [search, setSearch] = useState("")
  const [sortAmount, setSortAmount] = useState(null) // "asc" or "desc"

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return "N/A"
    return canEdit ? aadhaar : "XXXX-XXXX-" + aadhaar.slice(-4)
  }

  const formatDate = (date) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  const filteredMembers = useMemo(() => {
    let list = [...members]

    // Filter by search input
    if (search.trim()) {
      const lower = search.toLowerCase()
      list = list.filter(
        (m) =>
          (m.name || "").toLowerCase().includes(lower) ||
          (m.position || "").toLowerCase().includes(lower) ||
          (m.role || "").toLowerCase().includes(lower)
      )
    }

    // Sort by contribution
    if (sortAmount === "asc") {
      list.sort((a, b) => (a.contribution || 0) - (b.contribution || 0))
    } else if (sortAmount === "desc") {
      list.sort((a, b) => (b.contribution || 0) - (a.contribution || 0))
    }

    return list
  }, [members, search, sortAmount])

  /* =========================
     RENDER
  ========================= */
  if (loading) return <TableSkeleton rows={5} columns={canEdit ? 8 : 7} />

  return (
    <div>
      {/* ================= SEARCH + SORT CONTROLS ================= */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by Name, Position, Role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none flex-1 min-w-[200px]"
        />

        <select
          value={sortAmount || ""}
          onChange={(e) => setSortAmount(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
        >
          <option value="">Sort by Contribution</option>
          <option value="asc">Low → High</option>
          <option value="desc">High → Low</option>
        </select>
      </div>

      {/* ================= MEMBER TABLE ================= */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-[700px] w-full text-sm sm:text-base">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Position</th>
              <th className="p-3">Role</th>
              <th className="p-3">Aadhaar</th>
              <th className="p-3">Joining Date</th>
              <th className="p-3">Contribution</th>
              <th className="p-3">Status</th>
              {canEdit && <th className="p-3">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filteredMembers.length === 0 && (
              <tr>
                <td
                  colSpan={canEdit ? 8 : 7}
                  className="p-6 text-center text-gray-500"
                >
                  No members found
                </td>
              </tr>
            )}

            {filteredMembers.map((member) => (
              <tr
                key={member._id}
                className="border-b hover:bg-orange-50 transition"
              >
                <td
                  className="p-4 text-blue-600 cursor-pointer font-medium"
                  onClick={() => onView(member)}
                >
                  {member.name || "N/A"}
                </td>
                <td className="p-4">{member.position || "—"}</td>
                <td className="p-4">{member.role || "User"}</td>
                <td className="p-4">{maskAadhaar(member.aadhaar)}</td>
                <td className="p-4">{formatDate(member.joiningDate)}</td>
                <td className="p-4">
                  ₹
                  {typeof member.contribution === "number"
                    ? member.contribution.toLocaleString("en-IN")
                    : "0"}
                </td>
                <td className="p-4">
                  <span
                    className={member.active ? "text-green-600" : "text-red-500"}
                  >
                    {member.active ? "Active" : "Inactive"}
                  </span>
                </td>

                {canEdit && (
                  <td className="p-4 flex gap-2 whitespace-nowrap">
                    <button
                      onClick={() => onEdit(member)}
                      className="bg-blue-500 px-3 py-1 text-white rounded hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(member._id)}
                      className="bg-red-500 px-3 py-1 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
