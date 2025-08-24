const express = require("express")
const { body, param } = require("express-validator")
const multer = require("multer")
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController")
const { protect, authorizeRoles } = require("../middleware/auth")
const validateRequest = require("../middleware/validateRequest")

const router = express.Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/") 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = file.originalname.split(".").pop()
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`)
  },
})
const upload = multer({ storage })
const productValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Product name must be between 2 and 100 characters"),
  body("description").trim().isLength({ min: 10, max: 500 }).withMessage("Description must be between 10 and 500 characters"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
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
 *     summary: Create new product (Admin or Superadmin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 format: binary
 *               category:
 *                 type: string
 *               origin:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Insufficient privileges)
 */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("image"),
  productValidation,
  validateRequest,
  createProduct
)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product (Admin or Superadmin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 format: binary
 *               category:
 *                 type: string
 *               origin:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Insufficient privileges)
 *       404:
 *         description: Product not found
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("image"),
  idValidation,
  productValidation,
  validateRequest,
  updateProduct
)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (Superadmin only)
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Insufficient privileges)
 *       404:
 *         description: Product not found
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles("superadmin"),
  idValidation,
  validateRequest,
  deleteProduct
)

module.exports = router
