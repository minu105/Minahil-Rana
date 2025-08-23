const mongoose = require("mongoose")
require("dotenv").config()

const Product = require("../src/models/Product")

async function getProductIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    const products = await Product.find({}, { _id: 1, name: 1 }).limit(5)

    console.log("\n=== Available Product IDs ===")
    products.forEach((product) => {
      console.log(`Product: ${product.name}`)
      console.log(`ID: ${product._id}`)
      console.log("---")
    })

    if (products.length > 0) {
      console.log("\n=== Sample Cart Data ===")
      console.log(
        JSON.stringify(
          {
            productId: products[0]._id.toString(),
            quantity: 1,
          },
          null,
          2,
        ),
      )
    }
  } catch (error) {
    console.error("Error:", error.message)
  } finally {
    await mongoose.disconnect()
  }
}

getProductIds()
