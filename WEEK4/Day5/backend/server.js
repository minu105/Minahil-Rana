const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const swaggerUi = require("swagger-ui-express")
// Import configuration and documentation
const connectDB = require("./src/config/db")
const swaggerSpec = require("./src/docs/swagger")

// Import routes
const authRoutes = require("./src/routes/authRoutes")
const productRoutes = require("./src/routes/productRoutes")
const cartRoutes = require("./src/routes/cartRoutes")
const userRoutes = require("./src/routes/userRoutes")

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const path = require("path");
app.use("/images", express.static(path.join(__dirname, "images")));

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["http://localhost:5000"],
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
connectDB()

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Tea E-commerce API Documentation",
  }),
)
// Serve static images also under /api/images
app.use(
  "/api/images",
  express.static(path.join(__dirname, "images"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
    },
  })
)
// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/users", userRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Tea E-commerce API is running successfully",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Tea E-commerce API",
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
    health: `${req.protocol}://${req.get("host")}/api/health`,
  })
})

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }))
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    })
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    })
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      auth: "/api/auth",
      products: "/api/products",
      cart: "/api/cart",
      docs: "/api-docs",
      health: "/api/health",
    },
  })
})

app.listen(PORT, () => {
  console.log(`-> Server running on port ${PORT}`)
  console.log(`-> API Documentation: http://localhost:${PORT}/api-docs`)
  console.log(`-> Health Check: http://localhost:${PORT}/api/health`)
  console.log(`-> Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
