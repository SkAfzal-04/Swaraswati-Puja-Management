export default function MemberProfile({ member, currentUserRole, onClose }) {
  if (!member) return null

  const isAdmin = currentUserRole === "Admin"

  // 🔐 Aadhaar masking
  const aadhaar =
    isAdmin && member.aadhaar
      ? member.aadhaar
      : member.aadhaar
      ? "XXXX-XXXX-" + member.aadhaar.slice(-4)
      : "N/A"

  // 📅 Date formatting
  const joiningDate = member.joiningDate
    ? new Date(member.joiningDate).toLocaleDateString("en-IN")
    : "N/A"

  // 💰 Contribution
  const contribution =
    typeof member.contribution === "number"
      ? member.contribution.toLocaleString("en-IN")
      : "0"

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md">
      <h2 className="text-2xl font-bold mb-4">👤 Member Profile</h2>

      <p><b>Name:</b> {member.name || "N/A"}</p>
      <p><b>Role:</b> {member.role || "User"}</p>
      <p><b>Position:</b> {member.position || "N/A"}</p>
      <p><b>Aadhaar:</b> {aadhaar}</p>
      <p><b>Phone:</b> {member.phone || "N/A"}</p>
      <p><b>Joined:</b> {joiningDate}</p>
      <p>
        <b>Status:</b>{" "}
        <span className={member.active ? "text-green-600" : "text-red-500"}>
          {member.active ? "Active" : "Inactive"}
        </span>
      </p>
      <p>
        <b>Total Contribution:</b> ₹{contribution}
      </p>

      <button
        onClick={onClose}
        className="mt-4 w-full px-4 py-2 bg-orange-500 text-white rounded"
      >
        Close
      </button>
    </div>
  )
}
