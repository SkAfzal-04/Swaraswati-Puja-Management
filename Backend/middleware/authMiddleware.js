import jwt from "jsonwebtoken"

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not logged in" })
  }

  try {
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // ✅ Normalize user object
    req.user = {
      _id: decoded.id??decoded._id,
      role: decoded.role
    }

    next()
  } catch (err) {
    console.error("JWT error:", err)
    return res.status(401).json({ message: "Invalid token" })
  }
}
