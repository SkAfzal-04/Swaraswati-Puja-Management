import Transaction from "../models/Transaction.js"
import Donor from "../models/Doner.js"
import Member from "../models/Member.js"
import Expense from "../models/Expense.js"

/* =========================================================
   ➕ ADD INCOME (CHANDA / DONATION)
   - Public donor OR member
   - Can be Paid or Due
========================================================= */
export const addIncome = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      memberId,
      amount,
      type,
      pujaYear,
      isPaid,
      para // <-- include para from frontend
    } = req.body
    console.log("Add Income Request Body:", req.body)

    if (!["Chanda", "Donation"].includes(type)) {
      return res.status(400).json({ message: "Invalid income type" })
    }

    if (!amount || !pujaYear || !para) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    let member = null
    let donor = null
    let finalType = type
    let txnName = name || ""
    let txnPhone = phoneNumber || ""

    /* -------------------- MEMBER CONTRIBUTION -------------------- */
    if (memberId) {
      member = await Member.findById(memberId)
      if (!member) {
        return res.status(404).json({ message: "Member not found" })
      }

      finalType = "Member Contribution"
      txnName = member.name
      txnPhone = member.phone || ""

      if (isPaid) {
        await Member.findByIdAndUpdate(memberId, {
          $inc: { contribution: Number(amount) }
        })
      }
    }

    /* -------------------- PUBLIC DONATION -------------------- */
    else if (type === "Donation") {
      if (!name && !phoneNumber) {
        return res.status(400).json({ message: "Donor info required" })
      }

      donor = await Donor.create({
        name: name || "Anonymous",
        phoneNumber: phoneNumber || ""
      })

      txnName = donor.name
      txnPhone = donor.phoneNumber
    }

    /* -------------------- CREATE TRANSACTION -------------------- */
    const transaction = await Transaction.create({
      member: member ? member._id : null,
      donor: donor ? donor._id : null,
      name: txnName,
      phoneNumber: txnPhone,
      para, // ✅ include para
      amount: Number(amount),
      paidAmount: isPaid ? Number(amount) : 0,
      paymentStatus: isPaid ? "Paid" : "Due",
      paidDate: isPaid ? new Date() : null,
      type: finalType,
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
    const { amount, category, paymentMode, pujaYear, notes } = req.body

    if (!amount || !category || !pujaYear) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    const expense = await Expense.create({
      amount: Number(amount),
      category,
      paymentMode: paymentMode || "Cash",
      paidDate: new Date(),
      addedBy: req.user.id,
      pujaYear: Number(pujaYear),
      notes: notes || ""
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
      .populate("member", "name phone")
      .sort({ createdAt: -1 })
      console.log("Fetched Transactions:", transactions)

    res.json(transactions)
  } catch (err) {
    console.error("Get Transactions Error:", err)
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   📋 GET ALL EXPENSES
========================================================= */
export const getExpenses = async (req, res) => {
  try {
    const { pujaYear } = req.query
    const match = pujaYear ? { pujaYear: Number(pujaYear) } : {}

    const expenses = await Expense.find(match)
      .populate("addedBy", "userId role")
      .sort({ createdAt: -1 })

    res.json(expenses)
  } catch (err) {
    console.error("Get Expenses Error:", err)
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   📈 INCOME SUMMARY
========================================================= */
export const getSummary = async (req, res) => {
  try {
    const { pujaYear } = req.query
    const match = { paymentStatus: "Paid" }
    if (pujaYear) match.pujaYear = Number(pujaYear)

    // Only include Chanda, Donation, or Member Contribution
    const types = ["Chanda", "Donation", "Member Contribution"]
    match.type = { $in: types }

    // Aggregate total income
    const incomeTx = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $ifNull: ["$paidAmount", 0] } }
        }
      }
    ])

    // Aggregate total expense
    const expenseTx = await Expense.aggregate([
      { $match: pujaYear ? { pujaYear: Number(pujaYear) } : {} },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: { $ifNull: ["$amount", 0] } }
        }
      }
    ])

    res.json({
      totalIncome: incomeTx[0]?.totalIncome || 0,
      totalExpense: expenseTx[0]?.totalExpense || 0,
      balance: (incomeTx[0]?.totalIncome || 0) - (expenseTx[0]?.totalExpense || 0)
    })
  } catch (err) {
    console.error("Get Summary Error:", err)
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   🏆 TOP DONORS
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
========================================================= */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const txn = await Transaction.findById(id)
    if (!txn) return res.status(404).json({ message: "Transaction not found" })

    if (txn.member && txn.paymentStatus === "Paid") {
      await Member.findByIdAndUpdate(txn.member, { $inc: { contribution: -txn.paidAmount } })
    }

    await Transaction.findByIdAndDelete(id)
    res.json({ message: "Transaction deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   🗑️ DELETE EXPENSE
========================================================= */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params
    const expense = await Expense.findById(id)
    if (!expense) return res.status(404).json({ message: "Expense not found" })

    await Expense.findByIdAndDelete(id)
    res.json({ message: "Expense deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


/* =========================================================
   🔄 MARK DUE INCOME AS PAID
========================================================= */

/* =========================================================
   ✏️ UPDATE INCOME
========================================================= */
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params
    const { name, phoneNumber, memberId, para, amount, type, pujaYear, isPaid } = req.body

    const txn = await Transaction.findById(id)
    if (!txn) return res.status(404).json({ message: "Transaction not found" })

    // Adjust member contribution if payment status changes
    if (txn.member) {
      if (txn.paymentStatus === "Paid" && !isPaid) {
        await Member.findByIdAndUpdate(txn.member, { $inc: { contribution: -txn.paidAmount } })
      }
      if (txn.paymentStatus === "Due" && isPaid) {
        await Member.findByIdAndUpdate(txn.member, { $inc: { contribution: Number(amount) } })
      }
    }

    // Update donor info if public donor
    if (txn.donor) {
      await Donor.findByIdAndUpdate(txn.donor, {
        name: name || "Anonymous",
        phoneNumber: phoneNumber || ""
      })
    }

    txn.name = name || txn.name
    txn.phoneNumber = phoneNumber || txn.phoneNumber
    txn.para = para
    txn.amount = Number(amount)
    txn.type = memberId ? "Member Contribution" : type
    txn.pujaYear = Number(pujaYear)
    txn.paymentStatus = isPaid ? "Paid" : "Due"
    txn.paidAmount = isPaid ? Number(amount) : 0
    txn.paidDate = isPaid ? new Date() : null
    txn.member = memberId || txn.member

    await txn.save()

    res.json({ message: "Income updated successfully", txn })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   ✏️ UPDATE EXPENSE
========================================================= */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, category, paymentMode, pujaYear, notes } = req.body

    const expense = await Expense.findById(id)
    if (!expense) return res.status(404).json({ message: "Expense not found" })

    expense.amount = Number(amount)
    expense.category = category
    expense.paymentMode = paymentMode || "Cash"
    expense.pujaYear = Number(pujaYear)
    expense.notes = notes || expense.notes
    expense.paidDate = new Date()

    await expense.save()

    res.json({ message: "Expense updated successfully", expense })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* =========================================================
   📊 PARA-WISE COLLECTION
========================================================= */
export const paraWiseCollection = async (req, res) => {
  try {
    const { pujaYear } = req.query
    const match = { type: { $in: ["Chanda", "Donation", "Member Contribution"] } }
    if (pujaYear) match.pujaYear = Number(pujaYear)
    match.paymentStatus = "Paid"

    const data = await Transaction.aggregate([
      { $match: match },
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
    const { pujaYear } = req.query
    const match = { type: { $in: ["Chanda", "Donation", "Member Contribution"] } }
    if (pujaYear) match.pujaYear = Number(pujaYear)
    match.paymentStatus = "Paid"

    const data = await Transaction.aggregate([
      { $match: match },
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
    const { pujaYear } = req.query
    const matchIncome = { type: { $in: ["Chanda", "Donation", "Member Contribution"] }, paymentStatus: "Paid" }
    const matchExpense = {}
    if (pujaYear) {
      matchIncome.pujaYear = Number(pujaYear)
      matchExpense.pujaYear = Number(pujaYear)
    }

    const incomeData = await Transaction.aggregate([
      { $match: matchIncome },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } }
    ])

    const expenseData = await Expense.aggregate([
      { $match: matchExpense },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])

    const totalIncome = incomeData[0]?.total || 0
    const totalExpense = expenseData[0]?.total || 0

    res.json({ totalIncome, totalExpense, balance: totalIncome - totalExpense })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
