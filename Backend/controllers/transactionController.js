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
      memberId,
      amount,
      paidAmount = 0,
      type,
      pujaYear,
      para = ""
    } = req.body

    if (!amount || !pujaYear) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    let member = null
    let donor = null
    let finalType = type
    let txnName = name || ""

    /* ---------------- MEMBER ---------------- */
    if (memberId) {
      member = await Member.findById(memberId)
      if (!member) return res.status(404).json({ message: "Member not found" })

      finalType = "Member Contribution"
      txnName = member.name
    }

    /* ---------------- DONOR ---------------- */
    else if (type === "Donation") {
      if (!name) return res.status(400).json({ message: "Donor name required" })

      donor = await Donor.create({ name: name || "Anonymous" })
      txnName = donor.name
    }

    const paid = Number(paidAmount)
    const total = Number(amount)

    const transaction = await Transaction.create({
      member: member?._id || null,
      donor: donor?._id || null,
      name: txnName,
      para,
      amount: total,
      paidAmount: paid,
      paymentStatus: paid >= total ? "Paid" : "Due",
      paidDate: paid > 0 ? new Date() : null,
      type: finalType,
      addedBy: req.user._id,
      pujaYear: Number(pujaYear)
    })

    if (member && paid > 0) {
      await Member.findByIdAndUpdate(member._id, { $inc: { contribution: paid } })
    }

    res.status(201).json(transaction)
  } catch (err) {
    console.error("Add Income Error:", err)
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
      //console.log("Fetched Transactions:", transactions)

    res.json(transactions)
  } catch (err) {
    console.error("Get Transactions Error:", err)
    res.status(500).json({ message: err.message })
  }
}


/* =========================================================
   📈 INCOME SUMMARY
========================================================= */


export const getSummary = async (req, res) => {
  try {
    const { pujaYear } = req.query
    const baseMatch = {}
    if (pujaYear) baseMatch.pujaYear = Number(pujaYear)

    // Valid income types from transactions
    const incomeTypes = ["Chanda", "Donation", "Member Contribution"]

    /* ===============================
       💰 TRANSACTION INCOME SUMMARY
    =============================== */
    const incomeAgg = await Transaction.aggregate([
      { $match: { ...baseMatch, type: { $in: incomeTypes } } },
      {
        $group: {
          _id: null,
          totalBudgetTx: { $sum: { $ifNull: ["$amount", 0] } },        // Paid + Due
          actualCollectionTx: { $sum: { $ifNull: ["$paidAmount", 0] } } // Paid only
        }
      }
    ])

    const totalBudgetTx = incomeAgg[0]?.totalBudgetTx || 0
    const actualCollectionTx = incomeAgg[0]?.actualCollectionTx || 0

    /* ===============================
       🧾 MEMBER CONTRIBUTION SUMMARY
    =============================== */
    const members = await Member.find({ active: true }).select("contribution")
    const totalMemberContribution = members.reduce(
      (sum, m) => sum + (m.contribution || 0),
      0
    )

    /* ===============================
       💸 EXPENSE SUMMARY
    =============================== */
    const expenseAgg = await Expense.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: { $ifNull: ["$amount", 0] } }
        }
      }
    ])
    const totalExpense = expenseAgg[0]?.totalExpense || 0

    /* ===============================
       🧮 FINAL RESPONSE
    =============================== */
    const totalCollection = actualCollectionTx + totalMemberContribution
    const expectedCollection = totalBudgetTx + totalMemberContribution
    const dueAmount = expectedCollection - totalCollection

    res.json({
      totalCollection,             // Paid only (transactions + members)
      totalMemberContribution,      // Only member contributions
      dueAmount,                    // Due amount
      expectedCollection,           // Total including due
      totalExpense,                 // Expenses
      TotalChandaExceptMembers: totalCollection - totalMemberContribution // Cash in hand minus expenses
    })
  } catch (err) {
    console.error("Get Summary Error:", err)
    res.status(500).json({ message: err.message })
  }
}


/* =========================================================
   🏆 TOP DONORS
========================================================= */
/* =========================================================
   🏆 TOP DONORS (with names)
========================================================= */
export const topDonors = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          type: "Donation",
          donor: { $ne: null },
          paidAmount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$donor",
          total: { $sum: "$paidAmount" }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "donors",
          localField: "_id",
          foreignField: "_id",
          as: "donorInfo"
        }
      },
      { $unwind: "$donorInfo" },
      {
        $project: {
          _id: 0,
          name: "$donorInfo.name",
          total: 1
        }
      }
    ])

    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


/* =========================================================
   📊 BAR CHART DATA FOR COLLECTIONS
   - Total Member Contribution
   - Total Donor Paid
   - Total Chanda Paid
   - Only paidAmount is considered
========================================================= */
export const getCollectionBarGraph = async (req, res) => {
  try {
    const { pujaYear } = req.query
    const match = { paidAmount: { $gt: 0 } }

    if (pujaYear) match.pujaYear = Number(pujaYear)

    // ------------------- MEMBER CONTRIBUTION -------------------
    const memberAgg = await Member.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$contribution" }
        }
      }
    ])
    const totalMember = memberAgg[0]?.totalPaid || 0

    // ------------------- DONOR PAID -------------------
    const donorAgg = await Transaction.aggregate([
      { $match: { ...match, type: "Donation", donor: { $ne: null } } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$paidAmount" }
        }
      }
    ])
    const totalDonor = donorAgg[0]?.totalPaid || 0

    // ------------------- CHANDA PAID -------------------
    const chandaAgg = await Transaction.aggregate([
      { $match: { ...match, type: "Chanda" } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$paidAmount" }
        }
      }
    ])
    const totalChanda = chandaAgg[0]?.totalPaid || 0

    // ------------------- RESPONSE -------------------
    res.json({
      labels: ["Member Contribution", "Donor Paid", "Chanda Paid"],
      datasets: [
        {
          label: "Paid Collection",
          data: [totalMember, totalDonor, totalChanda],
          backgroundColor: ["#A78BFA", "#60A5FA", "#14B8A6"]
        }
      ]
    })
  } catch (err) {
    console.error("Bar Graph Error:", err)
    res.status(500).json({ message: err.message })
  }
}


/* =========================================================
   📅 DONOR BY DATE (with names)
========================================================= */
export const donorByDate = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          type: "Donation",
          donor: { $ne: null },
          paidAmount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            donor: "$donor",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$paidDate"
              }
            }
          },
          totalPaid: { $sum: "$paidAmount" }
        }
      },
      {
        $lookup: {
          from: "donors",
          localField: "_id.donor",
          foreignField: "_id",
          as: "donorInfo"
        }
      },
      { $unwind: "$donorInfo" },
      {
        $project: {
          _id: 0,
          name: "$donorInfo.name",
          date: "$_id.date",
          totalPaid: 1
        }
      },
      { $sort: { date: 1 } }
    ])

    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


/* =========================================================
   📈 EXPENSE BY DATE (line graph)
========================================================= */
export const expenseByItem = async (req, res) => {
  try {
    const { pujaYear } = req.query
    const match = {}

    if (pujaYear) match.pujaYear = Number(pujaYear)

    // Return each expense entry with item, amount, and exact paidDate
    const data = await Expense.aggregate([
      { $match: match },

      // Project only needed fields
      {
        $project: {
          category: 1,
          amount: 1,
          paidDate: 1, // keeps full date + time
          _id: 0
        }
      },
 

      // Optional: sort by paidDate
      { $sort: { paidDate: 1 } }
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
   🔄 MARK DUE INCOME AS PAID
========================================================= */

/* =========================================================
   ✏️ UPDATE INCOME
========================================================= */
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, paidAmount, para, name } = req.body

    const transaction = await Transaction.findById(id)
    if (!transaction) return res.status(404).json({ message: "Transaction not found" })

    const total = Number(amount)
    const paid = Number(paidAmount)

    if (paid > total) {
      return res.status(400).json({ message: "Paid amount cannot exceed total amount" })
    }

    transaction.amount = total
    transaction.paidAmount = paid
    transaction.para = para || ""
    transaction.name = name || transaction.name

    transaction.paymentStatus = paid >= total ? "Paid" : "Due"
    transaction.paidDate = paid > 0 ? new Date() : null

    await transaction.save()

    res.status(200).json({
      success: true,
      message: "Income updated successfully",
      transaction
    })
  } catch (err) {
    console.error("Update income error:", err)
    res.status(500).json({ success: false, message: "Failed to update income" })
  }
}


/* =========================================================
   📊 PARA-WISE COLLECTION
========================================================= */
export const paraWiseCollection = async (req, res) => {
  try {
    const { pujaYear } = req.query

    const match = {
      type: { $in: ["Chanda", "Donation"] },
      paidAmount: { $gt: 0 }
    }

    if (pujaYear) match.pujaYear = Number(pujaYear)

    const data = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$para",
          total: { $sum: "$paidAmount" }
        }
      },
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
    const { pujaYear } = req.query;

    /* ===============================
       💰 TRANSACTIONS (REAL CASH ONLY)
    =============================== */
    const txnMatch = {
      type: { $in: ["Chanda", "Donation"] },
      paidDate: { $ne: null },
      paidAmount: { $gt: 0 }
    };

    if (pujaYear) txnMatch.pujaYear = Number(pujaYear);

    const txnData = await Transaction.aggregate([
      { $match: txnMatch },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$paidDate"
            }
          },
          total: { $sum: "$paidAmount" }
        }
      }
    ]);

    /* ===============================
       👥 MEMBER CONTRIBUTIONS
       (COUNTED ON JOINING DATE)
    =============================== */
    const memberMatch = {
      active: true,
      contribution: { $gt: 0 }
    };

    if (pujaYear) {
      memberMatch.joiningDate = {
        $gte: new Date(`${pujaYear}-01-01`),
        $lte: new Date(`${pujaYear}-12-31`)
      };
    }

    const memberData = await Member.aggregate([
      { $match: memberMatch },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$joiningDate"
            }
          },
          total: { $sum: "$contribution" }
        }
      }
    ]);

    /* ===============================
       🔀 MERGE BOTH SOURCES BY DATE
    =============================== */
    const incomeMap = {};

    txnData.forEach(d => {
      incomeMap[d._id] = (incomeMap[d._id] || 0) + d.total;
    });

    memberData.forEach(d => {
      incomeMap[d._id] = (incomeMap[d._id] || 0) + d.total;
    });

    const result = Object.keys(incomeMap)
      .sort()
      .map(date => ({
        date,
        total: incomeMap[date]
      }));

    res.json(result);
  } catch (err) {
    console.error("Day Wise Collection Error:", err);
    res.status(500).json({ message: err.message });
  }
};


/* =========================================================
   📈 INCOME VS EXPENSE
========================================================= */


export const incomeVsExpense = async (req, res) => {
  try {
    const { pujaYear } = req.query;

    /* ===============================
       💰 TRANSACTION INCOME (REAL CASH)
    =============================== */
    const txnMatch = {
      type: { $in: ["Chanda", "Donation"] },
      paidDate: { $ne: null },
      paidAmount: { $gt: 0 }
    };

    if (pujaYear) txnMatch.pujaYear = Number(pujaYear);

    const txnIncome = await Transaction.aggregate([
      { $match: txnMatch },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidDate" }
          },
          total: { $sum: "$paidAmount" }
        }
      }
    ]);

    /* ===============================
       👥 MEMBER CONTRIBUTIONS
       (ONE-TIME ON JOINING DATE)
    =============================== */
    const memberMatch = {
      active: true,
      contribution: { $gt: 0 }
    };

    if (pujaYear) {
      memberMatch.joiningDate = {
        $gte: new Date(`${pujaYear}-01-01`),
        $lte: new Date(`${pujaYear}-12-31`)
      };
    }

    const memberIncome = await Member.aggregate([
      { $match: memberMatch },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$joiningDate"
            }
          },
          total: { $sum: "$contribution" }
        }
      }
    ]);

    /* ===============================
       🔀 MERGE TOTAL INCOME BY DATE
    =============================== */
    const incomeMap = {};

    txnIncome.forEach(d => {
      incomeMap[d._id] = (incomeMap[d._id] || 0) + d.total;
    });

    memberIncome.forEach(d => {
      incomeMap[d._id] = (incomeMap[d._id] || 0) + d.total;
    });

    /* ===============================
       💸 EXPENSES (REAL CASH OUT)
    =============================== */
    const expenseMatch = {};
    if (pujaYear) expenseMatch.pujaYear = Number(pujaYear);

    const expenseData = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidDate" }
          },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const expenseMap = {};
    expenseData.forEach(d => {
      expenseMap[d._id] = d.total;
    });

    /* ===============================
       📊 FINAL MERGED RESPONSE
    =============================== */
    const allDates = Array.from(
      new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])
    ).sort();

    const result = allDates.map(date => ({
      date,
      income: incomeMap[date] || 0,
      expense: expenseMap[date] || 0
    }));

    res.json(result);
  } catch (err) {
    console.error("Income vs Expense Error:", err);
    res.status(500).json({ message: err.message });
  }
};




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
      addedBy: req.user._id, // ✅ FIXED
      pujaYear: Number(pujaYear),
      notes: notes || "",
    })

    res.status(201).json(expense)
  } catch (err) {
    console.error("Add Expense Error:", err)
    res.status(400).json({ message: err.message })
  }
}

/* =========================================================
   📋 GET ALL EXPENSES
========================================================= */
export const getExpenses = async (req, res) => {
  try {
    const { pujaYear } = req.query
    const filter = pujaYear ? { pujaYear: Number(pujaYear) } : {}

    const expenses = await Expense.find(filter)
      .populate("addedBy", "name role")
      .sort({ createdAt: -1 })
    //console.log("Fetched Expenses:", expenses)

    res.json(expenses)
  } catch (err) {
    console.error("Get Expenses Error:", err)
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

    if (!amount || !category || !pujaYear) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    const expense = await Expense.findById(id)
    if (!expense) return res.status(404).json({ message: "Expense not found" })

    expense.amount = Number(amount)
    expense.category = category
    expense.paymentMode = paymentMode || "Cash"
    expense.pujaYear = Number(pujaYear)
    expense.notes = notes ?? expense.notes
    expense.paidDate = new Date()

    await expense.save()

    res.json({ message: "Expense updated successfully", expense })
  } catch (err) {
    console.error("Update Expense Error:", err)
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
    console.error("Delete Expense Error:", err)
    res.status(500).json({ message: err.message })
  }
}