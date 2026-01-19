import express from "express"
import {
  addIncome,
  addExpense,
  updateIncome,
  markIncomeAsPaid,
  deleteTransaction,
  updateExpense,
  deleteExpense,
  getTransactions,
  getSummary,
  paraWiseCollection,
  dayWiseCollection,
  incomeVsExpense,
  topDonors
} from "../controllers/transactionController.js"
import { protect } from "../middleware/authMiddleware.js" // if you have auth

const router = express.Router()

/* =========================================================
   📊 GET
========================================================= */
router.get("/summary", getSummary)
router.get("/",  getTransactions)
router.get("/graphs/para", protect, paraWiseCollection)
router.get("/graphs/day", protect, dayWiseCollection)
router.get("/graphs/income-expense", protect, incomeVsExpense)
router.get("/graphs/top-donors", protect, topDonors)

/* =========================================================
   ➕ ADD
========================================================= */
router.post("/income", protect, addIncome)
router.post("/expense", protect, addExpense)

/* =========================================================
   🔄 MARK INCOME AS PAID
========================================================= */
router.patch("/income/:id/pay", protect, markIncomeAsPaid)

/* =========================================================
   ✏️ UPDATE
========================================================= */
router.patch("/income/:id", protect, updateIncome)
router.patch("/expense/:id", protect, updateExpense)  // <-- new

/* =========================================================
   🗑️ DELETE
========================================================= */
router.delete("/transaction/:id", protect, deleteTransaction)
router.delete("/expense/:id", protect, deleteExpense)  // <-- new

export default router
