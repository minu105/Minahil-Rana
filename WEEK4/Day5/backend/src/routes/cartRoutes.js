const express = require("express")
const { body, param } = require("express-validator")
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController")
const { protect } = require("../middleware/auth")
const validateRequest = require("../middleware/validateRequest")

const router = express.Router()

// All cart routes require authentication
router.use(protect)

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: User shopping cart management
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get the current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user's cart (creates a new one if not exists)
 */
router.get("/", getCart)

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Item added successfully
 */
router.post(
  "/add",
  [
    body("productId").isMongoId().withMessage("Invalid product ID"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
  ],
  validateRequest,
  addToCart
)

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     summary: Update quantity of an item in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart updated successfully
 */
router.put(
  "/update",
  [
    body("productId").isMongoId().withMessage("Invalid product ID"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
  ],
  validateRequest,
  updateCartItem
)

/**
 * @swagger
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product to remove
 *     responses:
 *       200:
 *         description: Item removed successfully
 */
router.delete(
  "/remove/:productId",
  [param("productId").isMongoId().withMessage("Invalid product ID")],
  validateRequest,
  removeFromCart
)

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear the entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete("/clear", clearCart)

module.exports = router
