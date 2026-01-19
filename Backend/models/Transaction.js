import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema(
  {
    // Only used for Donations, not Chanda
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      default: null
    },

    // Optional member (used for Chanda or Donations by members)
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null
    },

    // Public Chanda or Donation info (if not a member/donor)
    name: {
      type: String,
      default: "" // optional for Chanda by public
    },
    phoneNumber: {
      type: String,
      default: "" // optional for Chanda by public
    },

    // Para (used for Chanda and Donations)
    para: {
      type: String,
      default: ""
    },

    // Amount expected
    amount: {
      type: Number,
      required: true
    },

    // Amount actually received (can be less than amount)
    paidAmount: {
      type: Number,
      default: 0
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["Paid", "Due"],
      default: "Paid"
    },

    // Type of transaction
    type: {
      type: String,
      enum: ["Chanda", "Donation", "Expense"],
      required: true
    },

    // Only for Expenses
    category: {
      type: String,
      default: ""
    },

    // Only for Expenses
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

/* ======= Virtual field for display ======= */
transactionSchema.virtual("displayName").get(function () {
  if (this.type === "Chanda") {
    // Prefer member name, else fallback to public name
    return this.member?.name || this.name || "Anonymous"
  }
  if (this.type === "Donation") {
    return this.donor?.name || this.member?.name || this.name || "Anonymous"
  }
  return ""
})

transactionSchema.virtual("displayPhone").get(function () {
  if (this.type === "Chanda") {
    return this.member?.phone || this.phoneNumber || "-"
  }
  if (this.type === "Donation") {
    return this.donor?.phoneNumber || this.member?.phone || this.phoneNumber || "-"
  }
  return "-"
})

export default mongoose.model("Transaction", transactionSchema)
