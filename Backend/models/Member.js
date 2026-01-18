import mongoose from "mongoose"

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ["User", "Manager", "Admin"], default: "User" },
  position: String,
  phone: String,
  aadhaar: String,
  active: { type: Boolean, default: true },
  contribution: Number,
  joiningDate: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // if Manager
})

export default mongoose.model("Member", memberSchema)
