export default function MemberTable({
  members,
  currentUserRole,
  onView,
  onEdit,
  onDelete
}) {
  const canEdit = currentUserRole === "Admin" || currentUserRole === "Manager"

  const maskAadhaar = aadhaar => {
    if (!aadhaar) return "N/A"
    return canEdit ? aadhaar : "XXXX-XXXX-" + aadhaar.slice(-4)
  }

  const formatDate = date => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  return (
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
          {members.length === 0 && (
            <tr>
              <td
                colSpan={canEdit ? 8 : 7}
                className="p-6 text-center text-gray-500"
              >
                No members found
              </td>
            </tr>
          )}

          {members.map(member => (
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
                  className={
                    member.active ? "text-green-600" : "text-red-500"
                  }
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
  )
}
