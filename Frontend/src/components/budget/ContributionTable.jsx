import { useState, useMemo } from "react"
import { markIncomeAsPaid, deleteTransaction } from "../../services/transactionApi"
import AddIncomeModal from "../budget/AddIncomeModal"
import AddExpenseModal from "../budget/AddExpenseModal"

export default function ContributionTable({ data = [], role, fetchData }) {
  console.log("ContributionTable data:", data)
  const [editData, setEditData] = useState(null)
  const [showExpense, setShowExpense] = useState(false)

  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("All") // "All", "Member", "Donor", "Chanda"
  const [sortAmount, setSortAmount] = useState(null) // "asc" | "desc" | null

  const incomes = data.filter((t) => t.type !== "Expense")
  const expenses = data.filter((t) => t.type === "Expense")

  /* ================= BUTTON STYLES ================= */
  const btnBase =
    "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95"
  const btnPrimary =
    `${btnBase} bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:ring-blue-500`
  const btnDanger =
    `${btnBase} bg-red-600 text-white hover:bg-red-700 hover:shadow-md focus:ring-red-500`
  const btnWarning =
    `${btnBase} bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-md focus:ring-yellow-400`
  const btnToggle =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"

  /* ================= HANDLERS ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return
    try {
      await deleteTransaction(id)
      fetchData?.()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      await markIncomeAsPaid(id)
      fetchData?.()
    } catch (err) {
      console.error("Mark paid failed:", err)
    }
  }

  /* ================= FILTERED & SORTED DATA ================= */
  const filteredIncomes = useMemo(() => {
    let list = [...incomes]

    // Filter type
    if (filterType === "Member") list = list.filter((t) => t.member)
    else if (filterType === "Donor") list = list.filter((t) => t.donor)
    else if (filterType === "Chanda") list = list.filter((t) => t.type === "Chanda")

    // Search
    if (search) {
      list = list.filter(
        (t) =>
          (t.donor?.name || t.member?.name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (t.para || "").toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by amount
    if (sortAmount === "asc") list.sort((a, b) => a.amount - b.amount)
    else if (sortAmount === "desc") list.sort((a, b) => b.amount - a.amount)

    return list
  }, [incomes, search, filterType, sortAmount])

  return (
    <>
      {/* ================= TOGGLE & SEARCH/FILTER/SORT ================= */}
      <div className="flex flex-wrap gap-3 justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowExpense((p) => !p)}
            className={`${btnToggle} ${showExpense
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
          >
            {showExpense ? "Show Contributions" : "Show Expenses"}
          </button>

          {!showExpense && (
            <>
              {/* Search */}
              <input
                type="text"
                placeholder="Search by Name or Para"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Member">Member</option>
                <option value="Donor">Donor</option>
                <option value="Chanda">Chanda</option>
              </select>

              {/* Sort */}
              <select
                value={sortAmount || ""}
                onChange={(e) =>
                  setSortAmount(e.target.value === "" ? null : e.target.value)
                }
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sort by Amount</option>
                <option value="asc">Amount: Low → High</option>
                <option value="desc">Amount: High → Low</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* ================= CONTRIBUTIONS TABLE ================= */}
      {!showExpense && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Para</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                {(role === "Admin" || role === "Manager") && (
                  <th className="px-4 py-2 text-left">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No contributions found
                  </td>
                </tr>
              )}
              {filteredIncomes.map((t) => (
                <tr key={t._id} className={t.paymentStatus === "Due" ? "bg-red-50" : ""}>
                  <td className="px-4 py-2">
                    {t.donor?.name || t.member?.name || t.name || "Anonymous"}
                  </td>
                  <td className="px-4 py-2">
                    {(() => {
                      const phone = t.donor?.phoneNumber || t.member?.phone || t.phoneNumber || "-"
                      if (role === "Admin" || role === "Manager") return phone
                      if (phone.length >= 4) {
                        return `${phone.slice(0, 2)}${"X".repeat(phone.length - 4)}${phone.slice(-2)}`
                      }
                      return phone
                    })()}
                  </td>


                  <td className="px-4 py-2">{t.para}</td>
                  <td className="px-4 py-2">₹ {t.amount}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${t.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {t.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2">{new Date(t.paidDate || t.createdAt).toLocaleDateString()}</td>
                  {(role === "Admin" || role === "Manager") && (
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => setEditData(t)} className={btnPrimary}>Edit</button>
                        {role === "Manager" && t.paymentStatus === "Due" && (
                          <button onClick={() => handleMarkPaid(t._id)} className={btnWarning}>Mark Paid</button>
                        )}
                        {role === "Admin" && (
                          <button onClick={() => handleDelete(t._id)} className={btnDanger}>Delete</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= EXPENSES TABLE ================= */}
      {showExpense && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Payment Method</th>
                {(role === "Admin" || role === "Manager") && (
                  <th className="px-4 py-2 text-left">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No expenses found
                  </td>
                </tr>
              )}
              {expenses.map((e) => (
                <tr key={e._id}>
                  <td className="px-4 py-2">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">₹ {e.amount}</td>
                  <td className="px-4 py-2">{e.category}</td>
                  <td className="px-4 py-2">{e.paymentMode}</td>
                  {(role === "Admin" || role === "Manager") && (
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => setEditData(e)} className={btnPrimary}>Edit</button>
                        {role === "Admin" && (
                          <button onClick={() => handleDelete(e._id)} className={btnDanger}>Delete</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODALS ================= */}
      {editData && editData.type === "Expense" && (
        <AddExpenseModal
          key={editData._id}
          editData={editData}
          fetchData={fetchData}
          onClose={() => setEditData(null)}
        />
      )}
      {editData && editData.type !== "Expense" && (
        <AddIncomeModal
          key={editData._id}
          editData={editData}
          fetchData={fetchData}
          onClose={() => setEditData(null)}
        />
      )}
    </>
  )
}
