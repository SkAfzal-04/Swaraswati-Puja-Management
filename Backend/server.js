import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import memberRoutes from "./routes/memberRoutes.js"
import transactionRoutes from "./routes/transactionRoutes.js"
import seedAdmin from "./utils/seedAdmin.js"
import { migrateMemberContributions } from "./config/migrate.js"

dotenv.config()

// Connect DB
connectDB().then(seedAdmin)

const app = express()

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
)

app.use(express.json())
//migrateMemberContributions() // Run migration once

/* -------------------- ROOT ENDPOINT -------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀"
  })
})

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes)
app.use("/api/members", memberRoutes)
app.use("/api/transactions", transactionRoutes)

/* -------------------- LOCAL SERVER -------------------- */
const PORT = process.env.PORT || 5000

// 🔥 Only listen locally (NOT on Vercel)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

// 🔥 REQUIRED for Vercel
export default app
