import { useState, useEffect } from "react"
import BudgetCards from "../components/budget/BudgetCard"
import ContributionTable from "../components/budget/ContributionTable"
import BudgetGraphs from "../components/budget/BudgetGraphs"
import AddIncomeModal from "../components/budget/AddIncomeModal"
import AddExpenseModal from "../components/budget/AddExpenseModal"
import { getSummary, getTransactions, getExpenses, deleteTransaction, deleteExpense } from "../services/transactionApi"
import toast from "react-hot-toast"

export default function Budget() {
  const [role, setRole] = useState(null)
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [transactions, setTransactions] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIncome, setShowIncome] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [showGraphs, setShowGraphs] = useState(false)

  // -------------------- REFRESH FUNCTION --------------------
  const refreshData = async () => {
    await Promise.all([fetchSummary(), fetchTransactions()])
  }

  const [deleteId, setDeleteId] = useState(null)
  const [deleteType, setDeleteType] = useState("transaction") // "transaction" or "expense"

  const canEdit = role === "Admin" || role === "Manager"

  /* -------------------- LOAD ROLE -------------------- */
  useEffect(() => {
    const savedRole = localStorage.getItem("role")
    setRole(savedRole)
  }, [])

  /* -------------------- FETCH SUMMARY -------------------- */
  const fetchSummary = async () => {
    try {
      const data = await getSummary()
      if (data) setSummary(data)
    } catch (err) {
      console.error("Failed to fetch summary:", err)
      toast.error("Failed to load summary")
    }
  }

  /* -------------------- FETCH TRANSACTIONS -------------------- */
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const txData = await getTransactions()
      const expData = await getExpenses()

      const mappedTx = (txData || []).map(tx => ({
        ...tx,
        displayName: tx.member?.name || tx.donor?.name || tx.name || "Anonymous",
        displayPhone: tx.member?.phone || tx.donor?.phoneNumber || tx.phoneNumber || "-",
        amount: tx.amount,
        paidAmount: tx.paidAmount,
        paymentStatus: tx.paymentStatus,
        type: tx.type,
        para: tx.para,
        pujaYear: tx.pujaYear,
        addedBy: tx.addedBy,
      }))

      setTransactions(mappedTx)
      setExpenses(expData || [])
    } catch (err) {
      console.error("Failed to fetch data:", err)
      toast.error("Failed to load contributions or expenses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
    fetchTransactions()
  }, [])

  const handleToggleAnalytics = () => setShowGraphs(prev => !prev)

  /* -------------------- DELETE HANDLER -------------------- */
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      if (deleteType === "expense") await deleteExpense(deleteId)
      else await deleteTransaction(deleteId)

      toast.success("Deleted successfully")
      refreshData()
    } catch (err) {
      console.error("Delete failed:", err)
      toast.error("Failed to delete")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-orange-50">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-orange-600">💰 Budget</h1>

        {canEdit && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowIncome(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
            >
              + Add Contribution
            </button>
            <button
              onClick={() => setShowExpense(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
            >
              + Add Expense
            </button>
            <button
              onClick={handleToggleAnalytics}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            >
              {showGraphs ? "Show Data Table" : "Show Analytics"}
            </button>
          </div>
        )}
      </div>

      {/* ---------------- SUMMARY CARDS ---------------- */}
      <BudgetCards summary={summary} />

      {/* ---------------- CONDITIONAL RENDER ---------------- */}
      {!showGraphs ? (
        <ContributionTable
          data={transactions}
          expensesData={expenses}
          role={role}
          loading={loading}
          fetchData={fetchTransactions}
          setDeleteId={setDeleteId}
          setDeleteType={setDeleteType}
        />
      ) : (
        <div className="mt-6">
          <BudgetGraphs />
        </div>
      )}

      {/* ---------------- MODALS ---------------- */}
      {showIncome && (
        <AddIncomeModal
          onClose={() => {
            setShowIncome(false)
            refreshData()
          }}
        />
      )}
      {showExpense && (
        <AddExpenseModal
          onClose={() => {
            setShowExpense(false)
            refreshData()
          }}
        />
      )}

      {/* ---------------- DELETE CONFIRMATION MODAL ---------------- */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-4 max-w-xs w-full border border-red-300">
            <p className="text-red-700 text-center font-semibold">
              Are you sure you want to delete this {deleteType === "expense" ? "expense" : "contribution"}?
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
    </div>
  )
}
