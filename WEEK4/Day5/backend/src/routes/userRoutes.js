const express = require("express")
const { protect, authorizeRoles } = require("../middleware/auth")
const {
  getAllUsers,
  blockUser,
  unblockUser,
  changeUserRole,
  getCustomers,
  getAdmins,
} = require("../controllers/userController")

const router = express.Router()

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/", protect, authorizeRoles("admin", "superadmin"), getAllUsers)

/**
 * @swagger
 * /api/users/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all customers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/customers", protect, authorizeRoles("admin", "superadmin"), getCustomers)

/**
 * @swagger
 * /api/users/admins:
 *   get:
 *     summary: Get all admins (superadmin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all admins
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/admins", protect, authorizeRoles("superadmin"), getAdmins)

/**
 * @swagger
 * /api/users/block/{id}:
 *   put:
 *     summary: Block a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to block
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.put("/block/:id", protect, authorizeRoles("admin", "superadmin"), blockUser)

/**
 * @swagger
 * /api/users/unblock/{id}:
 *   put:
 *     summary: Unblock a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to unblock
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.put("/unblock/:id", protect, authorizeRoles("admin", "superadmin"), unblockUser)

/**
 * @swagger
 * /api/users/role/{id}:
 *   put:
 *     summary: Change a user's role (customer/admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.put("/role/:id", protect, authorizeRoles("superadmin", "admin"), changeUserRole)

module.exports = router
