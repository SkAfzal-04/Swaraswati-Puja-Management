import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// LOGIN
export const login = async (req, res) => {
  const { userId, password } = req.body

  const user = await User.findOne({ userId })
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )

  res.json({ token, role: user.role })
}
// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id // from protect middleware
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) return res.status(401).json({ message: "Old password is incorrect" })

    await user.save()

    res.json({ message: "Password updated successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ADMIN CREATES MANAGER
export const createUser = async (req, res) => {
  const { userId, password, role } = req.body

  if (!["Admin", "Manager"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" })
  }

  const exists = await User.findOne({ userId })
  if (exists) {
    return res.status(400).json({ message: "User already exists" })
  }

  await User.create({ userId, password, role })

  res.status(201).json({ message: `${role} created successfully` })
}
