import { useState, useEffect } from "react"
import BudgetCards from "../components/budget/BudgetCard"
import ContributionTable from "../components/budget/ContributionTable"
import BudgetGraphs from "../components/budget/BudgetGraphs"
import AddIncomeModal from "../components/budget/AddIncomeModal"
import AddExpenseModal from "../components/budget/AddExpenseModal"
import { getSummary, getTransactions, getExpenses } from "../services/transactionApi"
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
      const expData = await getExpenses() // <-- fetch expenses

      // Map transactions for display
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
      setExpenses(expData || []) // <-- set expenses state
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

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-orange-50">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-orange-600">💰 Budget</h1>

        {/* ---------------- BUTTONS ---------------- */}
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
          expensesData={expenses} // <-- pass expenses as prop
          role={role}
          loading={loading}
          fetchData={() => {
            fetchTransactions()
            fetchSummary()
          }}
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
            fetchSummary()
            fetchTransactions()
          }}
        />
      )}
      {showExpense && (
        <AddExpenseModal
          onClose={() => {
            setShowExpense(false)
            fetchSummary()
            fetchTransactions()
          }}
        />
      )}
    </div>
  )
}
