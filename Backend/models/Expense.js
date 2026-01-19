import mongoose from "mongoose"

const expenseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ["Cash", "UPI", "Bank"], default: "Cash" },
  paidDate: { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  pujaYear: { type: Number, required: true },
  notes: { type: String, default: "" } // optional
}, { timestamps: true })

export default mongoose.model("Expense", expenseSchema)
