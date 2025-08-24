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
app.use(
  cors({
    origin: "https://minahilshabbir-week4-day5-hackathon-one.vercel.app", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
connectDB()
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Tea E-commerce API Documentation",
  }),
)
app.use(
  "/api/images",
  express.static(path.join(__dirname, "images"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
    },
  })
)
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/users", userRoutes)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Tea E-commerce API is running successfully",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
})

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Tea E-commerce API",
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
    health: `${req.protocol}://${req.get("host")}/api/health`,
  })
})

app.use((err, req, res, next) => {
  console.error("Error:", err.stack)
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

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    })
  }

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


module.exports = app
