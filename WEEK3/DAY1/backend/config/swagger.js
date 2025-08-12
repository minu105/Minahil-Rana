const swaggerJsdoc = require("swagger-jsdoc")

const PORT = 3000

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "1.0.0",
      description: "A simple Task Manager API",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ["./routes/*.js"], 
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

module.exports = { swaggerSpec }