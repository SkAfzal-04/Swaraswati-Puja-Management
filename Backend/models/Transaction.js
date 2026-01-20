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
      default: "" // optional
    },

    // Para (used for Chanda and Donations) — optional, can be blank
    para: {
      type: String,
      default: ""
    },

    // Amount expected
    amount: {
      type: Number,
      required: true
    },

    // Amount actually received
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
    return this.member?.name || this.name || "Anonymous"
  }
  if (this.type === "Donation") {
    return this.donor?.name || this.member?.name || this.name || "Anonymous"
  }
  return ""
})

// Removed phone virtual because phoneNumber is no longer used
transactionSchema.virtual("displayPhone").get(function () {
  if (this.type === "Chanda") {
    return this.member?.phone || "-"
  }
  if (this.type === "Donation") {
    return this.donor?.phoneNumber || this.member?.phone || "-"
  }
  return "-"
})

export default mongoose.model("Transaction", transactionSchema)
