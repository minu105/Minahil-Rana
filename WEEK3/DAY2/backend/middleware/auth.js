const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization")
    console.log("Auth header:", authHeader) // Debug log

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided or invalid format. Use 'Bearer <token>'",
      })
    }

    const token = authHeader.replace("Bearer ", "")
    console.log("Extracted token:", token.substring(0, 20) + "...") // Debug log (partial token)

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("Decoded token:", decoded) // Debug log

    const user = await User.findById(decoded.id).select("-password")
    console.log("Found user:", user ? user.email : "Not found") // Debug log

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid. User not found.",
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error) // Debug log

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token is not valid.",
      })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired.",
      })
    }
    res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    })
  }
}

module.exports = auth
