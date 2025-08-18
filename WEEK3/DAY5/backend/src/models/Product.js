const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Black teas", "Green teas", "White teas", "Chai", "Matcha", "Herbal teas", "Oolong", "Rooibos", "Teaware"],
    },
    collection: {
      type: String,
      enum: ["Black teas", "Green teas", "White teas", "Chai", "Matcha", "Herbal teas", "Oolong", "Rooibos", "Teaware"],
      default: "classic",
    },
    origin: {
      type: String,
      required: [true, "Origin is required"],
    },
    caffeineLevel: {
      type: String,
      enum: ["none", "low", "medium", "high"],
      default: "medium",
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for search functionality
productSchema.index({ name: "text", description: "text", tags: "text" })

module.exports = mongoose.model("Product", productSchema)
