import { apiFetch } from "../utils/api"  // relative path from services folder

/* =========================================================
   📊 SUMMARY & TRANSACTIONS
========================================================= */
export const getSummary = () => apiFetch("/transactions/summary")
export const getTransactions = () => apiFetch("/transactions")

/* =========================================================
   ➕ ADD INCOME / EXPENSE
========================================================= */
export const addIncome = (data) => apiFetch("/transactions/income", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})

export const addExpense = (data) => apiFetch("/transactions/expense", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})

/* =========================================================
   🔄 MARK INCOME AS PAID
========================================================= */
export const markIncomeAsPaid = (id) => apiFetch(`/transactions/income/${id}/pay`, {
  method: "PATCH"
})

/* =========================================================
   📊 GRAPHS / ANALYTICS
========================================================= */
export const getParaGraph = () => apiFetch("/transactions/graphs/para")
export const getDayGraph = () => apiFetch("/transactions/graphs/day")
export const getIncomeVsExpense = () => apiFetch("/transactions/graphs/income-expense")
export const getTopDonors = () => apiFetch("/transactions/graphs/top-donors")

/* =========================================================
   🗑️ DELETE TRANSACTION
========================================================= */
export const deleteTransaction = (id) => apiFetch(`/transactions/transaction/${id}`, {
  method: "DELETE"
})
