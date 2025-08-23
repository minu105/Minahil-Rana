const User = require("../models/User")

// Get all users (admins & superadmin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" })

    // Admin cannot block superadmin
    if (req.user.role === "admin" && targetUser.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Cannot block superadmin" })
    }

    targetUser.blocked = true
    await targetUser.save()

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
      data: targetUser,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Unblock a user
exports.unblockUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" })

    // Admin cannot unblock superadmin (superadmin is never blocked)
    if (req.user.role === "admin" && targetUser.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Cannot unblock superadmin" })
    }

    targetUser.blocked = false
    await targetUser.save()

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      data: targetUser,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Change user role (customer <-> admin)
exports.changeUserRole = async (req, res) => {
  const { role } = req.body // expected: "customer" or "admin"
  try {
    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" })

    // Validate requested role
    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" })
    }

    // Admin restrictions
    if (req.user.role === "admin") {
      if (targetUser.role === "admin" && role === "customer") {
        return res.status(403).json({ success: false, message: "Admin cannot downgrade another admin" })
      }
      if (targetUser.role === "superadmin") {
        return res.status(403).json({ success: false, message: "Cannot change superadmin role" })
      }
    }

    // Update role ONLY, do NOT touch password
    targetUser.role = role
    await targetUser.save()

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: targetUser,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}


// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password")
    res.status(200).json(customers) // send array directly for frontend
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get all admins (only superadmin can access)
exports.getAdmins = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied" })
    }
    const admins = await User.find({ role: "admin" }).select("-password")
    res.status(200).json(admins)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
