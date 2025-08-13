const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/authRoutes")
const taskRoutes = require("./routes/taskRoutes")
const swaggerRoutes = require("./routes/swaggerRoutes")

// Initialize Express app
const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"], // Add swagger UI origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.headers.authorization) {
    console.log("Authorization header present:", req.headers.authorization.substring(0, 20) + "...")
  }
  next()
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Manager API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API Routes
app.use("/api/users", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/docs", swaggerRoutes)

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Task Manager API v2.0",
    documentation: "/api/docs",
    health: "/health",
    endpoints: {
      authentication: {
        register: "POST /api/users/register",
        login: "POST /api/users/login",
        profile: "GET /api/users/profile",
      },
      tasks: {
        getAllTasks: "GET /api/tasks",
        getTask: "GET /api/tasks/:id",
        createTask: "POST /api/tasks",
        updateTask: "PUT /api/tasks/:id",
        deleteTask: "DELETE /api/tasks/:id",
        getStats: "GET /api/tasks/stats",
      },
    },
  })
})

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      documentation: "/api/docs",
      health: "/health",
      authentication: "/api/users/*",
      tasks: "/api/tasks/*",
    },
  })
})

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("Global Error Handler:", error)

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }))
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    })
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      field,
    })
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    })
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    })
  }

  // MongoDB connection errors
  if (error.name === "MongoNetworkError") {
    return res.status(503).json({
      success: false,
      message: "Database connection error",
    })
  }

  // Default server error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...")
  process.exit(0)
})

// Start server
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`
🚀 Task Manager API v2.0 is running!
📍 Server: http://localhost:${PORT}
📚 Documentation: http://localhost:${PORT}/api/docs
🏥 Health Check: http://localhost:${PORT}/health
🌍 Environment: ${process.env.NODE_ENV || "development"}
  `)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
  server.close(() => {
    process.exit(1)
  })
})

module.exports = app
