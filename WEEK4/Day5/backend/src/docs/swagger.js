const swaggerJsdoc = require("swagger-jsdoc")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tea E-commerce API",
      version: "1.0.0",
      description:
        "A comprehensive e-commerce API for tea products with authentication, product management, and cart functionality.",
      contact: {
        name: "Hackathon Team",
        email: "team@teaecommerce.com",
      },
    },
    servers: [
      {
        url: "https://minahil-rana.vercel.app/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["customer", "admin"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            image: { type: "string", format: "url" },
            category: {
              type: "string",
              enum: ["black-tea", "green-tea", "herbal-tea", "oolong-tea", "white-tea", "chai"],
            },
            collection: {
              type: "string",
              enum: ["premium", "classic", "organic", "seasonal"],
            },
            origin: { type: "string" },
            caffeineLevel: {
              type: "string",
              enum: ["none", "low", "medium", "high"],
            },
            stock: { type: "integer" },
            isActive: { type: "boolean" },
            tags: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Cart: {
          type: "object",
          properties: {
            id: { type: "string" },
            user: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { $ref: "#/components/schemas/Product" },
                  quantity: { type: "integer" },
                  price: { type: "number" },
                },
              },
            },
            totalAmount: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                  value: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and profile management",
      },
      {
        name: "Products",
        description: "Product management and catalog operations",
      },
      {
        name: "Cart",
        description: "Shopping cart operations",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
}

const specs = swaggerJsdoc(options)

module.exports = specs
