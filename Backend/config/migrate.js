import mongoose from "mongoose"
import Transaction from "../models/Transaction.js"
import Member from "../models/Member.js"

export const migrateMemberContributions = async () => {
  try {
    const members = await Member.find({ contribution: { $gt: 0 } })

    const transactions = members.map((m) => ({
      member: m._id,
      para: "Member Contribution",
      amount: m.contribution,
      paidAmount: m.contribution,
      paymentStatus: "Paid",
      paidDate: new Date(),
      type: "Chanda",
      addedBy: new mongoose.Types.ObjectId(), // ✅ use 'new' here
      pujaYear: new Date().getFullYear()
    }))

    await Transaction.insertMany(transactions)
    console.log("Migrated member contributions to transactions:", transactions.length)
  } catch (err) {
    console.error("Migration error:", err)
  }
}
