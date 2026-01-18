import User from "../models/User.js"

const seedAdmin = async () => {
  const adminExists = await User.findOne({ role: "Admin" })

  if (!adminExists) {
    await User.create({
      userId: process.env.ADMIN_USERID,
      password: process.env.ADMIN_PASSWORD, // bcrypt via schema
      role: "Admin"
    })

    console.log("✅ Dummy Admin created")
  }
}

export default seedAdmin
