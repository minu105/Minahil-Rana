const mongoose = require("mongoose")
const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "./.env") })  // ✅ Load .env from backend

const Product = require("./src/models/Product")


const sampleProducts = [
  {
    name: "Earl Grey Supreme",
    description: "A classic Earl Grey blend with bergamot oil and cornflower petals for a refined taste experience.",
    price: 24.99,
    image: "/images/Pic1.png",
    category: "black-tea",
    collection: "premium",
    origin: "Sri Lanka",
    caffeineLevel: "high",
    stock: 50,
    tags: ["bergamot", "citrus", "floral", "classic"],
  },
  {
    name: "Dragon Well Green Tea",
    description: "Traditional Chinese green tea with a delicate, sweet flavor and beautiful flat leaves.",
    price: 32.5,
    image: "/images/Pic2.png",
    category: "green-tea",
    collection: "classic",
    origin: "China",
    caffeineLevel: "medium",
    stock: 35,
    tags: ["traditional", "delicate", "sweet", "chinese"],
  },
  {
    name: "Chamomile Dreams",
    description: "Soothing chamomile flowers perfect for evening relaxation and better sleep.",
    price: 18.75,
    image: "/images/Pic3.png",
    category: "herbal-tea",
    collection: "organic",
    origin: "Egypt",
    caffeineLevel: "none",
    stock: 60,
    tags: ["relaxing", "floral", "bedtime", "soothing"],
  },
  {
    name: "Himalayan Gold Black Tea",
    description: "Premium high-altitude black tea with rich, malty flavor and golden liquor.",
    price: 28.0,
    image: "/images/Pic4.png",
    category: "black-tea",
    collection: "premium",
    origin: "Nepal",
    caffeineLevel: "high",
    stock: 40,
    tags: ["high-altitude", "malty", "premium", "golden"],
  },
  {
    name: "Jasmine Phoenix Pearls",
    description: "Hand-rolled green tea pearls scented with fresh jasmine flowers for an aromatic experience.",
    price: 42.5,
    image: "/images/Pic5.png",
    category: "green-tea",
    collection: "premium",
    origin: "China",
    caffeineLevel: "medium",
    stock: 25,
    tags: ["jasmine", "hand-rolled", "aromatic", "premium"],
  },
  {
    name: "Masala Chai Spice Blend",
    description: "Traditional Indian spice blend with cardamom, cinnamon, ginger, and cloves.",
    price: 22.0,
    image: "/images/Pic6.png",
    category: "chai",
    collection: "classic",
    origin: "India",
    caffeineLevel: "high",
    stock: 45,
    tags: ["spiced", "traditional", "warming", "indian"],
  },
  {
    name: "White Peony Tea",
    description: "Delicate white tea with subtle sweetness and light, refreshing character.",
    price: 38.0,
    image: "/images/Pic7.png",
    category: "white-tea",
    collection: "premium",
    origin: "China",
    caffeineLevel: "low",
    stock: 30,
    tags: ["delicate", "subtle", "refreshing", "light"],
  },
  {
    name: "Iron Goddess Oolong",
    description: "Traditional Tie Guan Yin oolong with complex floral notes and lasting sweetness.",
    price: 36.25,
    image: "/images/Pic8.png",
    category: "oolong-tea",
    collection: "premium",
    origin: "China",
    caffeineLevel: "medium",
    stock: 28,
    tags: ["floral", "complex", "traditional", "sweet"],
  },
  {
    name: "Peppermint Fresh",
    description: "Pure peppermint leaves for a refreshing and invigorating herbal experience.",
    price: 16.5,
    image: "/images/Pic9.png",
    category: "herbal-tea",
    collection: "organic",
    origin: "Morocco",
    caffeineLevel: "none",
    stock: 55,
    tags: ["minty", "refreshing", "cooling", "pure"],
  },
  {
    name: "English Breakfast Blend",
    description: "Robust morning blend perfect with milk and sugar for a traditional British experience.",
    price: 20.0,
    image: "/images/Pic1.png",
    category: "black-tea",
    collection: "classic",
    origin: "India",
    caffeineLevel: "high",
    stock: 65,
    tags: ["robust", "morning", "traditional", "strong"],
  },
]

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tea-ecommerce")
    console.log("✅ Connected to MongoDB")

    // Clear existing products
    await Product.deleteMany({})
    console.log("🗑️  Cleared existing products")

    // Insert sample products
    const products = await Product.insertMany(sampleProducts)
    console.log(`📦 Inserted ${products.length} sample products`)

    console.log("\n🍃 Sample Tea Products:")
    console.log("=".repeat(50))
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Category: ${product.category} | Collection: ${product.collection}`)
      console.log(`   Price: $${product.price} | Stock: ${product.stock} | Caffeine: ${product.caffeineLevel}`)
      console.log(`   Origin: ${product.origin}`)
      console.log("")
    })

    console.log("🎉 Database seeding completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding products:", error.message)
    process.exit(1)
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n⏹️  Seeding interrupted")
  await mongoose.connection.close()
  process.exit(0)
})

seedProducts()
