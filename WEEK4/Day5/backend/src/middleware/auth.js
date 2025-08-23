const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Basic JWT authentication
const protect = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(401).json({ success: false, message: "Token is not valid." })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: "Token is not valid." })
  }
}

// Role-based access control middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient privileges.",
      })
    }
    next()
  }
}

module.exports = { protect, authorizeRoles }
