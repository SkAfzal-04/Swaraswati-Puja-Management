import express from "express"
import { login, createUser, changePassword } from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js"
import { authorize } from "../middleware/roleMiddleware.js"

const router = express.Router()

router.post("/login", login)

// 👑 Only Admin can create Admin/Manager
router.post("/create-user", protect, authorize("Admin"), createUser)

// 🔐 Change password (any logged-in user)
router.post("/change-password", protect, changePassword)

export default router
