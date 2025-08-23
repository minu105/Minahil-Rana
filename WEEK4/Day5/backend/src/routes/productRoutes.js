const express = require("express");
const { body, param } = require("express-validator");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({ storage });

// Validation rules
const productValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Product name must be between 2 and 100 characters"),
  body("description").trim().isLength({ min: 10, max: 500 }).withMessage("Description must be between 10 and 500 characters"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("origin").trim().notEmpty().withMessage("Origin is required"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];

const idValidation = [param("id").isMongoId().withMessage("Invalid product ID")];

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 */
router.get("/", getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 */
router.get("/:id", idValidation, validateRequest, getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product (Admin or Superadmin)
 *     tags: [Products]
 */
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("image"),
  productValidation,
  validateRequest,
  createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product (Admin or Superadmin)
 *     tags: [Products]
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
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (Superadmin only)
 *     tags: [Products]
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles("superadmin"),
  idValidation,
  validateRequest,
  deleteProduct
);

module.exports = router;
