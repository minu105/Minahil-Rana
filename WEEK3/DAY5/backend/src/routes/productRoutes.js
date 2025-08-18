const express = require("express")
const { body, param, query } = require("express-validator")
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController")
const auth = require("../middleware/auth")
const validateRequest = require("../middleware/validateRequest")

const router = express.Router()

// Validation rules
const productValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Product name must be between 2 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("image").isURL().withMessage("Image must be a valid URL"),
  body("category")
    .isIn(["black-tea", "green-tea", "herbal-tea", "oolong-tea", "white-tea", "chai"])
    .withMessage("Invalid category"),
  body("origin").trim().notEmpty().withMessage("Origin is required"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
]

const idValidation = [param("id").isMongoId().withMessage("Invalid product ID")]

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [black-tea, green-tea, herbal-tea, oolong-tea, white-tea, chai]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/", getProducts)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/:id", idValidation, validateRequest, getProductById)

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - image
 *               - category
 *               - origin
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               origin:
 *                 type: string
 *               stock:
 *                 type: integer
 *             example:
 *               name: "Premium Green Tea"
 *               description: "High-quality organic green tea from Japan"
 *               price: 12.99
 *               image: "https://example.com/images/green-tea.jpg"
 *               category: "Beverages"
 *               origin: "Japan"
 *               stock: 50
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth, productValidation, validateRequest, createProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               origin:
 *                 type: string
 *               stock:
 *                 type: integer
 *             example:
 *               name: "Jasmine Green Tea"
 *               description: "A fragrant blend of premium green tea leaves with jasmine aroma."
 *               price: 10.99
 *               image: "https://example.com/images/jasmine-green-tea.jpg"
 *               category: "Green Tea"
 *               origin: "China"
 *               stock: 120
 *     responses:
 *       200:
 *         description: Product data fetched successfully (ready for edit) and updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 image:
 *                   type: string
 *                 category:
 *                   type: string
 *                 origin:
 *                   type: string
 *                 stock:
 *                   type: integer
 *             example:
 *               _id: "66b9f7e2e3f3a6c4b09e2d12"
 *               name: "Jasmine Green Tea"
 *               description: "A fragrant blend of premium green tea leaves with jasmine aroma."
 *               price: 10.99
 *               image: "https://example.com/images/jasmine-green-tea.jpg"
 *               category: "Green Tea"
 *               origin: "China"
 *               stock: 120
 *       404:
 *         description: Product not found
 */
router.put("/:id", auth, idValidation, productValidation, validateRequest, updateProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete("/:id", auth, idValidation, validateRequest, deleteProduct)

module.exports = router
