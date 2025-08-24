const User = require("../models/User")
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

exports.blockUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" })
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

exports.unblockUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" })
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

exports.changeUserRole = async (req, res) => {
  const { role } = req.body 
  try {
    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" })
    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" })
    }
    if (req.user.role === "admin") {
      if (targetUser.role === "admin" && role === "customer") {
        return res.status(403).json({ success: false, message: "Admin cannot downgrade another admin" })
      }
      if (targetUser.role === "superadmin") {
        return res.status(403).json({ success: false, message: "Cannot change superadmin role" })
      }
    }
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

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password")
    res.status(200).json(customers) 
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

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
