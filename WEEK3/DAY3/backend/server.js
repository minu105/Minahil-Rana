const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db")

dotenv.config()
const authRoutes = require("./routes/authRoutes")
const taskRoutes = require("./routes/taskRoutes")
const swaggerRoutes = require("./routes/swaggerRoutes")
const app = express()
connectDB()

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "https://minahilrana-week3-day3-frontend.vercel.app/",
      ]

      console.log(`CORS: Request from origin: ${origin}`)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        console.log(`CORS: Origin ${origin} not allowed`)
        callback(null, true) // Allow all origins for debugging
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  }),
)

app.options("*", (req, res) => {
  console.log("Preflight request received for:", req.path)
  res.header("Access-Control-Allow-Origin", req.headers.origin)
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  res.header("Access-Control-Allow-Credentials", true)
  res.sendStatus(200)
})

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.headers.authorization) {
    console.log("Authorization header present:", req.headers.authorization.substring(0, 20) + "...")
  }
  next()
})

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Manager API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

app.use("/api/users", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/docs", swaggerRoutes)

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
app.use((error, req, res, next) => {
  console.error("Global Error Handler:", error)
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

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      field,
    })
  }

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

  if (error.name === "MongoNetworkError") {
    return res.status(503).json({
      success: false,
      message: "Database connection error",
    })
  }
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...")
  process.exit(0)
})

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`
🚀 Task Manager API v2.0 is running!
📍 Server: http://localhost:${PORT}
📚 Documentation: http://localhost:${PORT}/api/docs
🏥 Health Check: http://localhost:${PORT}/health
🌍 Environment: ${process.env.NODE_ENV || "development"}
  `)
})
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
  server.close(() => {
    process.exit(1)
  })
})

module.exports = app
