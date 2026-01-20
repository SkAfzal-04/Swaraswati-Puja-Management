import { useState, useMemo } from "react"
import { deleteTransaction, deleteExpense } from "../../services/transactionApi"
import AddIncomeModal from "../budget/AddIncomeModal"
import AddExpenseModal from "../budget/AddExpenseModal"

export default function ContributionTable({ data = [], expensesData = [], role, fetchData }) {
  const [editData, setEditData] = useState(null)
  const [showExpense, setShowExpense] = useState(false)

  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [sortAmount, setSortAmount] = useState(null)

  // ===================== Separate contributions and expenses =====================
  const incomes = data || []
  const expenses = expensesData || []

  // ===================== Button Styles =====================
  const btnBase =
    "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95"
  const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`
  const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
  const btnToggle =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"

  // ===================== Delete Handler =====================
  const handleDelete = async (record, isExpense = false) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return
    try {
      if (isExpense) await deleteExpense(record._id)
      else await deleteTransaction(record._id)
      fetchData?.()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  // ===================== Filter + Sort =====================
  const filteredIncomes = useMemo(() => {
    let list = [...incomes]


     if (filterType === "Donor") list = list.filter((t) => t.donor)
    else if (filterType === "Chanda") list = list.filter((t) => t.type === "Chanda")

    if (search) {
      list = list.filter(
        (t) =>
          (t.donor?.name || t.member?.name || t.name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (t.para || "").toLowerCase().includes(search.toLowerCase())
      )
    }

    if (sortAmount === "asc") list.sort((a, b) => a.amount - b.amount)
    if (sortAmount === "desc") list.sort((a, b) => b.amount - a.amount)

    return list
  }, [incomes, search, filterType, sortAmount])

  return (
    <>
      {/* ================= TOP CONTROLS ================= */}
      <div className="flex flex-wrap gap-3 justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowExpense((p) => !p)}
            className={`${btnToggle} ${
              showExpense ? "bg-green-600 text-white" : "bg-purple-600 text-white"
            }`}
          >
            {showExpense ? "Show Contributions" : "Show Expenses"}
          </button>

          {!showExpense && (
            <>
              <input
                type="text"
                placeholder="Search by Name or Para"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Donor">Donor</option>
                <option value="Chanda">Chanda</option>
              </select>

              <select
                value={sortAmount || ""}
                onChange={(e) => setSortAmount(e.target.value || null)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sort by Amount</option>
                <option value="asc">Low → High</option>
                <option value="desc">High → Low</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* ================= CONTRIBUTIONS ================= */}
      {!showExpense && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Para</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Paid</th>
                <th className="px-4 py-2 text-left">Due</th>
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
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    No contributions found
                  </td>
                </tr>
              )}

              {filteredIncomes.map((t) => {
                const paid = t.paidAmount || 0
                const due = Math.max(0, t.amount - paid)

                return (
                  <tr
                    key={t._id}
                    className={t.paymentStatus === "Due" ? "bg-red-50" : ""}
                  >
                    <td className="px-4 py-2">
                      {t.donor?.name || t.member?.name || t.name || "Anonymous"}
                    </td>

                    <td className="px-4 py-2">
                      {(() => {
                        const phone =
                          t.donor?.phoneNumber ||
                          t.member?.phone ||
                          t.phoneNumber ||
                          "-"
                        if (role === "Admin" || role === "Manager") return phone
                        return phone.length >= 4
                          ? `${phone.slice(0, 2)}${"X".repeat(phone.length - 4)}${phone.slice(-2)}`
                          : phone
                      })()}
                    </td>

                    <td className="px-4 py-2">{t.para}</td>
                    <td className="px-4 py-2 font-medium">₹ {t.amount}</td>
                    <td className="px-4 py-2 text-green-700">₹ {paid}</td>
                    <td className="px-4 py-2 text-red-700 font-semibold">₹ {due}</td>

                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          t.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-2">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                    {(role === "Admin" || role === "Manager") && (
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          {t.paymentStatus === "Due" && (
                            <button onClick={() => setEditData(t)} className={btnPrimary}>
                              Edit
                            </button>
                          )}
                          {role === "Admin" && (
                            <button onClick={() => handleDelete(t, false)} className={btnDanger}>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= EXPENSES ================= */}
      {showExpense && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Payment Mode</th>
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
                  <td className="px-4 py-2">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">₹ {e.amount}</td>
                  <td className="px-4 py-2">{e.category}</td>
                  <td className="px-4 py-2">{e.paymentMode}</td>

                  {(role === "Admin" || role === "Manager") && (
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => setEditData({ ...e, isExpense: true })} className={btnPrimary}>
                          Edit
                        </button>
                        {role === "Admin" && (
                          <button onClick={() => handleDelete(e, true)} className={btnDanger}>
                            Delete
                          </button>
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
      {editData && editData.isExpense && (
        <AddExpenseModal
          editData={editData}
          fetchData={fetchData}
          onClose={() => setEditData(null)}
        />
      )}

      {editData && !editData.isExpense && (
        <AddIncomeModal
          editData={editData}
          fetchData={fetchData}
          onClose={() => setEditData(null)}
        />
      )}
    </>
  )
}
