import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import memberRoutes from "./routes/memberRoutes.js"
import seedAdmin from "./utils/seedAdmin.js"

dotenv.config()
connectDB().then(seedAdmin)

const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/members", memberRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
)
