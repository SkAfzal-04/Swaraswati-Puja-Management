import { apiFetch } from "../utils/api"

/* =========================================================
   📊 SUMMARY & TRANSACTIONS
========================================================= */
export const getSummary = () => apiFetch("/transactions/summary")
export const getTransactions = () => apiFetch("/transactions/transaction")
export const getExpenses = () => apiFetch("/transactions/expense") 
/* =========================================================
   ➕ ADD INCOME / EXPENSE
   - Supports partial payment via paidAmount
========================================================= */
export const addIncome = (data) =>
  apiFetch("/transactions/income", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      amount: Number(data.amount),
      paidAmount: Number(data.paidAmount || 0),
    }),
  })

export const addExpense = (data) =>
  apiFetch("/transactions/expense", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      amount: Number(data.amount),
    }),
  })

/* =========================================================
   ✏️ UPDATE INCOME / EXPENSE
========================================================= */
export const updateIncome = (id, data) =>
  apiFetch(`/transactions/income/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      amount: Number(data.amount),
      paidAmount: Number(data.paidAmount || 0),
    }),
  })

export const updateExpense = (id, data) =>
  apiFetch(`/transactions/expense/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      amount: Number(data.amount),
    }),
  })

/* =========================================================
   🗑️ DELETE INCOME / EXPENSE
========================================================= */
export const deleteTransaction = (id) =>
  apiFetch(`/transactions/transaction/${id}`, { method: "DELETE" })

export const deleteExpense = (id) =>
  apiFetch(`/transactions/expense/${id}`, { method: "DELETE" })

/* =========================================================
   📊 GRAPHS / ANALYTICS
========================================================= */
export const getParaGraph = () => apiFetch("/transactions/graphs/para")
export const getDayGraph = () => apiFetch("/transactions/graphs/day")
export const getIncomeVsExpense = () =>
  apiFetch("/transactions/graphs/income-expense")
export const getTopDonors = () =>
  apiFetch("/transactions/graphs/top-donors")
export const getDonorByDate = () => apiFetch("/transactions/graphs/donor-date")
export const getExpenseByDate = () =>
  apiFetch("/transactions/graphs/expense-date")

