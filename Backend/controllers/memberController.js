import Member from "../models/Member.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import Transaction from "../models/Transaction.js";
import Expense from "../models/Expense.js";


// ➕ Add Member
export const addMember = async (req, res) => {
  try {
    const { role, userId, password, ...rest } = req.body

    const validRoles = ["User", "Manager", "Admin"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const newMember = new Member({ ...rest, role })

    if (role === "Manager") {
      if (!userId || !password) {
        return res.status(400).json({ message: "User ID & Password required for Manager" })
      }

      const existingUser = await User.findOne({ userId })
      if (existingUser) {
        return res.status(400).json({ message: "User ID already exists" })
      }

      
      const newUser = new User({ userId, password: password, role: "Manager" })
      const savedUser = await newUser.save()

      // ✅ Assign the saved user's ID directly
      newMember.userId = savedUser._id
    }

    const savedMember = await newMember.save()
    res.status(201).json(savedMember)
  } catch (err) {
    console.error("Add Member Error:", err)
    res.status(400).json({ message: err.message })
  }
}

// 📄 Get All Members
export const getMembers = async (req, res) => {
  try {
    const members = await Member.find()
      .sort({ createdAt: -1 })
      .populate("userId", "userId role")
    return res.json(members)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

// ✏️ Update Member
export const updateMember = async (req, res) => {
  try {
    const { role, userId, password, ...rest } = req.body
    const member = await Member.findById(req.params.id)
    if (!member) return res.status(404).json({ message: "Member not found" })

    Object.assign(member, rest, { role })

    // Handle Manager login creation/update
    if (role === "Manager") {
      let user
      if (member.userId) {
        // Update existing user
        user = await User.findById(member.userId)
        if (userId) user.userId = userId
        if (password) user.password = await bcrypt.hash(password, 10)
        await user.save()
      } else {
        if (!userId || !password) return res.status(400).json({ message: "User ID & Password required for Manager" })
        const existingUser = await User.findOne({ userId })
        if (existingUser) return res.status(400).json({ message: "User ID already exists" })
        const hashedPassword = await bcrypt.hash(password, 10)
        user = await User.create({ userId, password: hashedPassword, role: "Manager" })
        member.userId = user._id
      }
    } else {
      // Remove login if no longer Manager
      if (member.userId) {
        await User.findByIdAndDelete(member.userId)
        member.userId = undefined
      }
    }

    const updatedMember = await member.save()
    return res.json(updatedMember)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ message: err.message })
  }
}

// ❌ Delete Member
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
    if (!member) return res.status(404).json({ message: "Member not found" })

    if (member.userId) await User.findByIdAndDelete(member.userId)
    await member.deleteOne()

    return res.json({ message: "Member deleted" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}




export const getStats = async (req, res) => {
  try {
    /* ===============================
       👥 TOTAL MEMBERS
    =============================== */
    const totalMembers = await Member.countDocuments({ active: true });

    /* ===============================
       💰 TRANSACTION COLLECTION (PAID)
    =============================== */
    const incomeTypes = ["Chanda", "Donation", "Member Contribution"];

    const incomeAgg = await Transaction.aggregate([
      { $match: { type: { $in: incomeTypes } } },
      {
        $group: {
          _id: null,
          actualCollectionTx: { $sum: { $ifNull: ["$paidAmount", 0] } }
        }
      }
    ]);

    const actualCollectionTx = incomeAgg[0]?.actualCollectionTx || 0;

    /* ===============================
       🧾 MEMBER CONTRIBUTIONS
    =============================== */
    const members = await Member.find({ active: true }).select("contribution");

    const totalMemberContribution = members.reduce(
      (sum, m) => sum + (m.contribution || 0),
      0
    );

    /* ===============================
       💸 TOTAL EXPENSES
    =============================== */
    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, totalExpense: { $sum: { $ifNull: ["$amount", 0] } } } }
    ]);

    const totalExpense = expenseAgg[0]?.totalExpense || 0;

    /* ===============================
       🧮 FINAL TOTAL COLLECTION
    =============================== */
    const totalCollection = actualCollectionTx + totalMemberContribution;

    res.json({
      members: totalMembers,
      totalCollection,    // Paid transactions + member contributions
      totalMemberContribution,
      totalExpense,
      remainingBalance: totalCollection - totalExpense
    });
  } catch (err) {
    console.error("Stats Fetch Error:", err);
    res.status(500).json({ message: err.message });
  }
};

