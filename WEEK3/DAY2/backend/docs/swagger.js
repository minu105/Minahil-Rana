const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "2.0.0",
      description:
        "A robust Task Manager API with JWT authentication, MongoDB persistence, and comprehensive CRUD operations",
      contact: {
        name: "API Support",
        email: "support@taskmanager.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://api.taskmanager.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User unique identifier",
              example: "64a7b8c9d1e2f3a4b5c6d7e8",
            },
            name: {
              type: "string",
              description: "User's full name",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "john.doe@example.com",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
              example: "2024-01-15T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              example: "2024-01-15T10:30:00.000Z",
            },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Task unique identifier",
              example: "64a7b8c9d1e2f3a4b5c6d7e9",
            },
            title: {
              type: "string",
              description: "Task title",
              example: "Complete project documentation",
            },
            description: {
              type: "string",
              description: "Detailed task description",
              example: "Write comprehensive API documentation with examples",
            },
            status: {
              type: "string",
              enum: ["pending", "in-progress", "completed"],
              description: "Current task status",
              example: "in-progress",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Task priority level",
              example: "high",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              description: "Task due date",
              example: "2024-02-01T23:59:59.000Z",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Task creation timestamp",
              example: "2024-01-15T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              example: "2024-01-15T10:30:00.000Z",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Login successful",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
                token: {
                  type: "string",
                  description: "JWT authentication token",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },
        TaskResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Task created successfully",
            },
            data: {
              type: "object",
              properties: {
                task: {
                  $ref: "#/components/schemas/Task",
                },
              },
            },
          },
        },
        TasksResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Task",
                  },
                },
                pagination: {
                  type: "object",
                  properties: {
                    currentPage: {
                      type: "integer",
                      example: 1,
                    },
                    totalPages: {
                      type: "integer",
                      example: 5,
                    },
                    totalTasks: {
                      type: "integer",
                      example: 47,
                    },
                    hasNextPage: {
                      type: "boolean",
                      example: true,
                    },
                    hasPrevPage: {
                      type: "boolean",
                      example: false,
                    },
                  },
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Validation failed",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    example: "email",
                  },
                  message: {
                    type: "string",
                    example: "Please provide a valid email",
                  },
                  value: {
                    type: "string",
                    example: "invalid-email",
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Validation failed",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    example: "title",
                  },
                  message: {
                    type: "string",
                    example: "Title is required and must be between 1 and 100 characters",
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // Path to the API files
}

const specs = swaggerJsdoc(options)

module.exports = {
  specs,
  swaggerUi,
}
