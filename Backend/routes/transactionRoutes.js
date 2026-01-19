import express from "express"
import {
  addIncome,
  addExpense,
  markIncomeAsPaid,
  getTransactions,
  getSummary,
  paraWiseCollection,
  dayWiseCollection,
  incomeVsExpense,
  topDonors,
  deleteTransaction  // ✅ import the new controller
} from "../controllers/transactionController.js"

import { protect } from "../middleware/authMiddleware.js"
import { authorize } from "../middleware/roleMiddleware.js"

const router = express.Router()

/* =========================================================
   ➕ ADD TRANSACTIONS
   - Admin / Manager only
========================================================= */
router.post(
  "/income",
  protect,
  authorize("Admin", "Manager"),
  addIncome
)

router.post(
  "/expense",
  protect,
  authorize("Admin", "Manager"),
  addExpense
)

/* =========================================================
   🔄 MARK DUE INCOME AS PAID
   - Admin / Manager only
========================================================= */
router.patch(
  "/income/:id/pay",
  protect,
  authorize("Admin", "Manager"),
  markIncomeAsPaid
)

/* =========================================================
   🗑️ DELETE TRANSACTION
   - Admin only
========================================================= */
router.delete(
  "/transaction/:id",
  protect,
  authorize("Admin"), // only admin
  deleteTransaction
)

/* =========================================================
   💰 SUMMARY & DASHBOARD DATA
   - Public access (no auth needed)
========================================================= */
router.get("/summary", getSummary)
router.get("/", getTransactions)

/* =========================================================
   📊 GRAPHS / ANALYTICS
   - Public access
========================================================= */
router.get("/graphs/para", paraWiseCollection)
router.get("/graphs/day", dayWiseCollection)
router.get("/graphs/income-expense", incomeVsExpense)
router.get("/graphs/top-donors", topDonors)

export default router
