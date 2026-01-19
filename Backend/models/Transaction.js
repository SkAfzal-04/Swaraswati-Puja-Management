import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      default: null
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null
    },

    para: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true // expected amount
    },

    paidAmount: {
      type: Number,
      default: 0 // actual received
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Due"],
      default: "Paid"
    },

    type: {
      type: String,
      enum: ["Chanda", "Donation", "Expense"],
      required: true
    },

    category: {
      type: String,
      default: ""
    },

    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank"],
      default: "Cash"
    },

    paidDate: {
      type: Date,
      default: null
    },

    date: {
      type: Date,
      default: Date.now
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    pujaYear: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)

export default mongoose.model("Transaction", transactionSchema)
