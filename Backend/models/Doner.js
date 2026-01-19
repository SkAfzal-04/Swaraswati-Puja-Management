import mongoose from "mongoose"

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ""
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
)

export default mongoose.model("Donor", donorSchema)
