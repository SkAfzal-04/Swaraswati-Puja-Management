import express from "express"
import { getMembers, addMember, updateMember, deleteMember, getStats } from "../controllers/memberController.js"
import { protect } from "../middleware/authMiddleware.js"
import { authorize } from "../middleware/roleMiddleware.js"

const router = express.Router()

// Public
router.get("/", getMembers)
router.get("/stats",getStats)

// Protected
router.post("/", protect, authorize("Admin", "Manager"), addMember)
router.put("/:id", protect, authorize("Admin", "Manager"), updateMember)
router.delete("/:id", protect, authorize("Admin"), deleteMember)

export default router
