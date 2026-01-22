import express from "express"
import {
  addIncome,
  addExpense,
  updateIncome,
  deleteTransaction,
  getExpenses,
  updateExpense,
  deleteExpense,
  getTransactions,
  getSummary,
  paraWiseCollection,
  dayWiseCollection,
  incomeVsExpense,
  donorByDate,
  topDonors,
  getCollectionBarGraph,
  expenseByItem
} from "../controllers/transactionController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

/* =========================================================
   📊 GET
========================================================= */
router.get("/summary", getSummary)
router.get("/transaction", getTransactions)
router.get("/expense", getExpenses)
router.get("/graphs/para", protect, paraWiseCollection)
router.get("/graphs/day", protect, dayWiseCollection)
router.get("/graphs/income-expense", protect, incomeVsExpense)
router.get("/graphs/top-donors", protect, topDonors)
router.get("/graphs/donor-date", protect, donorByDate)
router.get("/graphs/collection-bar", protect, getCollectionBarGraph)
router.get("/graphs/expense-date", protect, expenseByItem)
/* =========================================================
   ➕ ADD
========================================================= */
router.post("/income", protect, addIncome)
router.post("/expense", protect, addExpense)

/* =========================================================
   ✏️ UPDATE
========================================================= */
router.patch("/income/:id", protect, updateIncome)
router.patch("/expense/:id", protect, updateExpense)

/* =========================================================
   🗑️ DELETE
========================================================= */
router.delete("/transaction/:id", protect, deleteTransaction)
router.delete("/expense/:id", protect, deleteExpense)

export default router
