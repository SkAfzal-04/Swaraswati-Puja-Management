import Transaction from "../models/Transaction.js"
import Donor from "../models/Doner.js"
import Member from "../models/Member.js"

/* =========================================================
   ➕ ADD INCOME (CHANDA / DONATION)
   - Public donor OR member
   - Can be Paid or Due
   - Member contributions are now stored as transactions
========================================================= */
export const addIncome = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      memberId,     // optional
      para,
      amount,
      type,
      pujaYear,
      isPaid        // boolean from frontend
    } = req.body

    if (!["Chanda", "Donation"].includes(type)) {
      return res.status(400).json({ message: "Invalid income type" })
    }

    if (!para || !amount || !pujaYear) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    let donor = null

    // Public donor (non-member)
    if (!memberId && (name || phoneNumber)) {
      donor = await Donor.create({
        name: name || "Anonymous",
        phoneNumber: phoneNumber || ""
      })
    }

    // If memberId, update contribution field in Member (optional)
    if (memberId) {
      await Member.findByIdAndUpdate(memberId, {
        $inc: { contribution: Number(amount) }
      })
    }

    // Create a transaction for both public donors and members
    const transaction = await Transaction.create({
      donor: donor ? donor._id : null,
      member: memberId || null,
      para,
      amount: Number(amount),
      paidAmount: isPaid ? Number(amount) : 0,
      paymentStatus: isPaid ? "Paid" : "Due",
      paidDate: isPaid ? new Date() : null,
      type,
      addedBy: req.user.id,
      pujaYear: Number(pujaYear)
    })

    res.status(201).json(transaction)
  } catch (err) {
    console.error("Add Income Error:", err)
    res.status(400).json({ message: err.message })
  }
}

/* =========================================================
   ➖ ADD EXPENSE (ALWAYS PAID)
========================================================= */
export const addExpense = async (req, res) => {
  try {
    const { para, amount, category, paymentMode, pujaYear } = req.body

    if (!para || !amount || !category || !pujaYear) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    const expense = await Transaction.create({
      para,
      amount: Number(amount),
      paidAmount: Number(amount),
      paymentStatus: "Paid",
      paidDate: new Date(),
      category,
      paymentMode,
      type: "Expense",
      addedBy: req.user.id,
      pujaYear: Number(pujaYear)
    })

    res.status(201).json(expense)
  } catch (err) {
    console.error("Add Expense Error:", err)
    res.status(400).json({ message: err.message })
  }
}

/* =========================================================
   🔄 MARK DUE INCOME AS PAID
========================================================= */
export const markIncomeAsPaid = async (req, res) => {
  try {
    const { id } = req.params
    const txn = await Transaction.findById(id)
    if (!txn) return res.status(404).json({ message: "Transaction not found" })

    if (txn.type === "Expense") {
      return res.status(400).json({ message: "Expense is already paid" })
    }

    txn.paymentStatus = "Paid"
    txn.paidAmount = txn.amount
    txn.paidDate = new Date()
    await txn.save()

    // If member, update their contribution field as well
    if (txn.member) {
      await Member.findByIdAndUpdate(txn.member, { $inc: { contribution: txn.amount } })
    }

    res.json({ message: "Payment marked as paid", txn })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

/* =========================================================
   📋 GET ALL TRANSACTIONS
   - Populates donor and member names
========================================================= */
export const getTransactions = async (req, res) => {
  try {
    const { pujaYear } = req.query
    const match = pujaYear ? { pujaYear: Number(pujaYear) } : {}

    const transactions = await Transaction.find(match)
      .populate("donor", "name phoneNumber")
      .populate("member", "name")
      .sort({ createdAt: -1 })

    res.json(transactions)
  } catch (err) {
    console.error("Get Transactions Error:", err)
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   💰 SUMMARY (INCOME + MEMBER CONTRIBUTIONS)
========================================================= */
export const getSummary = async (req, res) => {
  try {
    const { pujaYear } = req.query
    const match = pujaYear ? { pujaYear: Number(pujaYear) } : {}

    // Sum all paid transactions
    const [incomeTx] = await Transaction.aggregate([
      { $match: { ...match, type: { $in: ["Chanda", "Donation"] }, paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } }
    ])

    const [expense] = await Transaction.aggregate([
      { $match: { ...match, type: "Expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])

    const totalIncome = incomeTx?.total || 0
    const totalExpense = expense?.total || 0

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   📊 PARA-WISE COLLECTION
========================================================= */
export const paraWiseCollection = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { type: { $in: ["Chanda", "Donation"] }, paymentStatus: "Paid" } },
      { $group: { _id: "$para", total: { $sum: "$paidAmount" } } },
      { $sort: { total: -1 } }
    ])
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   📅 DAY-WISE COLLECTION
========================================================= */
export const dayWiseCollection = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { type: { $in: ["Chanda", "Donation"] }, paymentStatus: "Paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidDate" } },
          total: { $sum: "$paidAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ])
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   📈 INCOME VS EXPENSE
========================================================= */
export const incomeVsExpense = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { type: "Expense" },
            { paymentStatus: "Paid" }
          ]
        }
      },
      {
        $group: {
          _id: "$type",
          total: {
            $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", "$paidAmount"] }
          }
        }
      }
    ])
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   🏆 TOP DONORS (PUBLIC)
========================================================= */
export const topDonors = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { type: { $in: ["Chanda", "Donation"] }, donor: { $ne: null }, paymentStatus: "Paid" } },
      { $group: { _id: "$donor", total: { $sum: "$paidAmount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ])
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
/* =========================================================
   🗑️ DELETE TRANSACTION
   - Adjusts member contribution if applicable
========================================================= */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params

    // Find the transaction
    const txn = await Transaction.findById(id)
    if (!txn) return res.status(404).json({ message: "Transaction not found" })

    // If it's a paid member transaction, decrement their contribution
    if (txn.member && txn.paymentStatus === "Paid") {
      await Member.findByIdAndUpdate(txn.member, {
        $inc: { contribution: -txn.paidAmount }
      })
    }

    // Delete the transaction
    await Transaction.findByIdAndDelete(id)

    res.json({ message: "Transaction deleted successfully" })
  } catch (err) {
    console.error("Delete Transaction Error:", err)
    res.status(500).json({ message: err.message })
  }
}

