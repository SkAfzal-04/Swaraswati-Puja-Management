import { useState, useMemo } from "react"
import AddIncomeModal from "../budget/AddIncomeModal"
import AddExpenseModal from "../budget/AddExpenseModal"

export default function ContributionTable({
  data = [],
  expensesData = [],
  role,
  refreshData,
  setDeleteId,
  setDeleteType,
  loading = false,
}) {
  const [editData, setEditData] = useState(null)
  const [showExpense, setShowExpense] = useState(false)
  const [search, setSearch] = useState("")
  const [filterOption, setFilterOption] = useState("All")
  const [sortAmount, setSortAmount] = useState(null)

  const incomes = data || []
  const expenses = expensesData || []

  const btnBase =
    "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95"
  const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`
  const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
  const btnToggle =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"

  const handleDelete = (record, isExpense = false) => {
    setDeleteId(record._id)
    setDeleteType(isExpense ? "expense" : "transaction")
  }

  // ================== FILTER & SORT ==================
  const filteredIncomes = useMemo(() => {
    let list = [...incomes]

    // Filter based on the selected option
    switch (filterOption) {
      case "Donor":
        list = list.filter((t) => t.donor)
        break
      case "Chanda":
        list = list.filter((t) => t.type === "Chanda")
        break
      case "Paid":
        list = list.filter((t) => t.paymentStatus === "Paid")
        break
      case "Due":
        list = list.filter((t) => t.paymentStatus === "Due")
        break
      case "Donor Paid":
        list = list.filter((t) => t.donor && t.paymentStatus === "Paid")
        break
      case "Donor Due":
        list = list.filter((t) => t.donor && t.paymentStatus === "Due")
        break
      case "Chanda Paid":
        list = list.filter((t) => t.type === "Chanda" && t.paymentStatus === "Paid")
        break
      case "Chanda Due":
        list = list.filter((t) => t.type === "Chanda" && t.paymentStatus === "Due")
        break
      default:
        break
    }

    // Search filter
    if (search) {
      list = list.filter(
        (t) =>
          (t.donor?.name || t.member?.name || t.name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (t.para || "").toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sorting
    if (sortAmount === "asc") list.sort((a, b) => a.amount - b.amount)
    if (sortAmount === "desc") list.sort((a, b) => b.amount - a.amount)

    return list
  }, [incomes, search, filterOption, sortAmount])

  // ================== SKELETON ==================
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {Array(8)
        .fill(0)
        .map((_, idx) => (
          <td key={idx} className="px-4 py-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </td>
        ))}
    </tr>
  )

  return (
    <>
      {/* ================== CONTROLS ================== */}
      <div className="flex flex-wrap gap-3 justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowExpense((p) => !p)}
            className={`${btnToggle} ${showExpense ? "bg-green-600 text-white" : "bg-purple-600 text-white"}`}
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

              {/* ================== SINGLE PROFESSIONAL FILTER ================== */}
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Donor">Donor</option>
                <option value="Chanda">Chanda</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
                <option value="Donor Paid">Donor Paid</option>
                <option value="Donor Due">Donor Due</option>
                <option value="Chanda Paid">Chanda Paid</option>
                <option value="Chanda Due">Chanda Due</option>
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

      {/* ================== CONTRIBUTIONS ================== */}
      {!showExpense && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Para</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Paid</th>
                <th className="px-4 py-2 text-left">Due</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                {(role === "Admin" || role === "Manager") && <th className="px-4 py-2 text-left">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array(5)
                    .fill(0)
                    .map((_, idx) => <SkeletonRow key={idx} />)
                : filteredIncomes.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-gray-500">
                        No contributions found
                      </td>
                    </tr>
                  )}

              {!loading &&
                filteredIncomes.map((t) => {
                  const paid = t.paidAmount || 0
                  const due = Math.max(0, t.amount - paid)

                  return (
                    <tr key={t._id} className={t.paymentStatus === "Due" ? "bg-red-50" : ""}>
                      <td className="px-4 py-2">{t.donor?.name || t.member?.name || t.name || "Anonymous"}</td>
                      <td className="px-4 py-2">{t.para}</td>
                      <td className="px-4 py-2 font-medium">₹ {t.amount}</td>
                      <td className="px-4 py-2 text-green-700">₹ {paid}</td>
                      <td className="px-4 py-2 text-red-700 font-semibold">₹ {due}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            t.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                      {(role === "Admin" || role === "Manager") && (
                        <td className="px-4 py-2 flex gap-2">
                          {t.paymentStatus === "Due" && <button onClick={() => setEditData(t)} className={btnPrimary}>Edit</button>}
                          {role === "Admin" && <button onClick={() => handleDelete(t, false)} className={btnDanger}>Delete</button>}
                        </td>
                      )}
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================== EXPENSES ================== */}
      {showExpense && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Payment Mode</th>
                {(role === "Admin" || role === "Manager") && <th className="px-4 py-2 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5)
                    .fill(0)
                    .map((_, idx) => <SkeletonRow key={idx} />)
                : expenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        No expenses found
                      </td>
                    </tr>
                  )}

              {!loading &&
                expenses.map((e) => (
                  <tr key={e._id}>
                    <td className="px-4 py-2">{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">₹ {e.amount}</td>
                    <td className="px-4 py-2">{e.category}</td>
                    <td className="px-4 py-2">{e.paymentMode}</td>
                    {(role === "Admin" || role === "Manager") && (
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => setEditData({ ...e, isExpense: true })} className={btnPrimary}>Edit</button>
                        {role === "Admin" && <button onClick={() => handleDelete(e, true)} className={btnDanger}>Delete</button>}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================== MODALS ================== */}
      {editData && editData.isExpense && (
        <AddExpenseModal
          editData={editData}
          fetchData={refreshData}
          onClose={() => {
            setEditData(null)
            refreshData()
          }}
        />
      )}

      {editData && !editData.isExpense && (
        <AddIncomeModal
          editData={editData}
          fetchData={refreshData}
          onClose={() => {
            setEditData(null)
            refreshData()
          }}
        />
      )}
    </>
  )
}
