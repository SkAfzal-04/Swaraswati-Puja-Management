import { markIncomeAsPaid, deleteTransaction } from "../../services/transactionApi"

export default function ContributionTable({ data = [], role, fetchData }) {
  const handleMarkPaid = async (id) => {
    try {
      await markIncomeAsPaid(id)
      fetchData?.()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return
    try {
      await deleteTransaction(id)
      fetchData?.()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white rounded-xl shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Phone</th>
            <th className="px-4 py-2 text-left">Para</th>
            <th className="px-4 py-2 text-left">Amount</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Date</th>
            {(role === "Admin" || role === "Manager") && <th className="px-4 py-2 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t._id} className={t.paymentStatus === "Due" ? "bg-red-50" : ""}>
              <td className="px-4 py-2">{t.donor?.name || t.member?.name || "Anonymous"}</td>
              <td className="px-4 py-2">{t.donor?.phoneNumber || t.member?.phone || "-"}</td>
              <td className="px-4 py-2">{t.para}</td>
              <td className="px-4 py-2">₹ {t.amount}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    t.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {t.paymentStatus || "-"}
                </span>
              </td>
              <td className="px-4 py-2">{new Date(t.paidDate || t.createdAt).toLocaleDateString()}</td>

              {(role === "Admin" || role === "Manager") && (
                <td className="px-4 py-2 flex gap-2">
                  {role === "Manager" && t.paymentStatus === "Due" && (
                    <button
                      onClick={() => handleMarkPaid(t._id)}
                      className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs"
                    >
                      Mark Paid
                    </button>
                  )}
                  {role === "Admin" && (
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                No contributions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
