const express = require("express")
const { specs, swaggerUi } = require("../docs/swagger")

const router = express.Router()

// Swagger UI setup
router.use("/", swaggerUi.serve)
router.get(
  "/",
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Task Manager API Documentation",
  }),
)

// JSON endpoint for API specification
router.get("/json", (req, res) => {
  res.setHeader("Content-Type", "application/json")
  res.send(specs)
})

module.exports = router
