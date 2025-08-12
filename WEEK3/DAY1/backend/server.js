const express = require("express")
const swaggerUi = require("swagger-ui-express")
const { swaggerSpec } = require("./config/swagger")
const taskRoutes = require("./routes/taskRoutes")
const { errorHandler } = require("./middleware/errorHandler")

const app = express()
const PORT = 3000
app.use(express.json())
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/api", taskRoutes)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`)
})
