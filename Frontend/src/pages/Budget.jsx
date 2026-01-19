import { useState, useEffect } from "react"
import BudgetCards from "../components/budget/BudgetCard"
import ContributionTable from "../components/budget/ContributionTable"
import BudgetGraphs from "../components/budget/BudgetGraphs"
import AddIncomeModal from "../components/budget/AddIncomeModal"
import AddExpenseModal from "../components/budget/AddExpenseModal"
import { getSummary, getTransactions } from "../services/transactionApi"

export default function Budget() {
  const [role, setRole] = useState(null)
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [transactions, setTransactions] = useState([])
  const [showIncome, setShowIncome] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [showGraphs, setShowGraphs] = useState(false)

  /* -------------------- LOAD ROLE -------------------- */
  useEffect(() => {
    const savedRole = localStorage.getItem("role")
    setRole(savedRole)
  }, [])

  /* -------------------- FETCH SUMMARY -------------------- */
  const fetchSummary = async () => {
    try {
      const data = await getSummary()
      setSummary(data)
    } catch (err) {
      console.error("Failed to load summary:", err)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  /* -------------------- FETCH TRANSACTIONS -------------------- */
  const fetchTransactions = async () => {
    try {
      const data = await getTransactions()
      setTransactions(data)
    } catch (err) {
      console.error("Failed to load transactions:", err)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const canEdit = role === "Admin" || role === "Manager"

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">💰 Budget</h1>

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
              onClick={() => setShowGraphs(!showGraphs)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            >
              {showGraphs ? "Hide Analytics" : "Show Analytics"}
            </button>
          </div>
        )}
      </div>

      {/* ---------------- SUMMARY CARDS ---------------- */}
      <BudgetCards summary={summary} />

      {/* ---------------- CONTRIBUTIONS TABLE ---------------- */}
      <ContributionTable
        data={transactions}
        role={role}
        fetchData={() => {
          fetchTransactions()
          fetchSummary()
        }}
      />

      {/* ---------------- GRAPHS ---------------- */}
      {showGraphs && (
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
