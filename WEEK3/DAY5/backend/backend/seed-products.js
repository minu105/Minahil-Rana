const mongoose = require("mongoose")
const Product = require("./src/models/Product")
require("dotenv").config()

const sampleProducts = [
  {
    name: "Earl Grey Supreme",
    description: "A classic Earl Grey blend with bergamot oil and cornflower petals for a refined taste experience.",
    price: 24.99,
    image: "/images/Pic1.png",
    category: "Black teas",
    collection: "Black teas",
    origin: "India",
    flavour: ["Citrus"],
    qualities: ["Energy"],
    caffeine: "High Caffeine",
    allergens: ["Lactose-free"],
    organic: false,
    stock: 50,
    tags: ["bergamot", "citrus", "floral", "classic"],
  },
  {
    name: "Dragon Well Green Tea",
    description: "Traditional Chinese green tea with a delicate, sweet flavor and beautiful flat leaves.",
    price: 32.5,
    image: "/images/Pic2.png",
    category: "Green teas",
    collection: "Green teas",
    origin: "Japan",
    flavour: ["Sweet"],
    qualities: ["Relax"],
    caffeine: "Medium Caffeine",
    allergens: ["Gluten-free"],
    organic: true,
    stock: 35,
    tags: ["traditional", "delicate", "sweet", "chinese"],
  },
  {
    name: "Chamomile Dreams",
    description: "Soothing chamomile flowers perfect for evening relaxation and better sleep.",
    price: 18.75,
    image: "/images/Pic3.png",
    category: "Herbal teas",
    collection: "Herbal teas",
    origin: "Iran",
    flavour: ["Floral"],
    qualities: ["Relax"],
    caffeine: "No Caffeine",
    allergens: ["Nuts-free"],
    organic: true,
    stock: 60,
    tags: ["relaxing", "floral", "bedtime", "soothing"],
  },
  {
    name: "Himalayan Gold Black Tea",
    description: "Premium high-altitude black tea with rich, malty flavor and golden liquor.",
    price: 28.0,
    image: "/images/Pic4.png",
    category: "Black teas",
    collection: "Black teas",
    origin: "India",
    flavour: ["Bitter"],
    qualities: ["Energy"],
    caffeine: "High Caffeine",
    allergens: ["Soy-free"],
    organic: false,
    stock: 40,
    tags: ["high-altitude", "malty", "premium", "golden"],
  },
  {
    name: "Jasmine Phoenix Pearls",
    description: "Hand-rolled green tea pearls scented with fresh jasmine flowers for an aromatic experience.",
    price: 42.5,
    image: "/images/Pic5.png",
    category: "Green teas",
    collection: "Green teas",
    origin: "Japan",
    flavour: ["Floral"],
    qualities: ["Relax"],
    caffeine: "Medium Caffeine",
    allergens: ["Lactose-free"],
    organic: false,
    stock: 25,
    tags: ["jasmine", "hand-rolled", "aromatic", "premium"],
  },
  {
    name: "Masala Chai Spice Blend",
    description: "Traditional Indian spice blend with cardamom, cinnamon, ginger, and cloves.",
    price: 22.0,
    image: "/images/Pic6.png",
    category: "Chai",
    collection: "Chai",
    origin: "India",
    flavour: ["Spicy"],
    qualities: ["Energy"],
    caffeine: "High Caffeine",
    allergens: ["Gluten-free"],
    organic: false,
    stock: 45,
    tags: ["spiced", "traditional", "warming", "indian"],
  },
  {
    name: "White Peony Tea",
    description: "Delicate white tea with subtle sweetness and light, refreshing character.",
    price: 38.0,
    image: "/images/Pic7.png",
    category: "White teas",
    collection: "White teas",
    origin: "Japan",
    flavour: ["Sweet"],
    qualities: ["Relax"],
    caffeine: "Low Caffeine",
    allergens: ["Nuts-free"],
    organic: true,
    stock: 30,
    tags: ["delicate", "subtle", "refreshing", "light"],
  },
  {
    name: "Iron Goddess Oolong",
    description: "Traditional Tie Guan Yin oolong with complex floral notes and lasting sweetness.",
    price: 36.25,
    image: "/images/Pic8.png",
    category: "Oolong",
    collection: "Oolong",
    origin: "Japan",
    flavour: ["Floral"],
    qualities: ["Relax"],
    caffeine: "Medium Caffeine",
    allergens: ["Soy-free"],
    organic: false,
    stock: 28,
    tags: ["floral", "complex", "traditional", "sweet"],
  },
  {
    name: "Peppermint Fresh",
    description: "Pure peppermint leaves for a refreshing and invigorating herbal experience.",
    price: 16.5,
    image: "/images/Pic9.png",
    category: "Herbal teas",
    collection: "Herbal teas",
    origin: "Iran",
    flavour: ["Minty"],
    qualities: ["Digestion"],
    caffeine: "No Caffeine",
    allergens: ["Lactose-free"],
    organic: true,
    stock: 55,
    tags: ["minty", "refreshing", "cooling", "pure"],
  },
  {
    name: "English Breakfast Blend",
    description: "Robust morning blend perfect with milk and sugar for a traditional British experience.",
    price: 20.0,
    image: "/images/Pic1.png",
    category: "Black teas",
    collection: "Black teas",
    origin: "India",
    flavour: ["Smooth"],
    qualities: ["Energy"],
    caffeine: "High Caffeine",
    allergens: ["Gluten-free"],
    organic: false,
    stock: 65,
    tags: ["robust", "morning", "traditional", "strong"],
  },
  {
    name: "Premium Matcha Powder",
    description: "Ceremonial grade matcha powder with vibrant green color and umami flavor.",
    price: 45.0,
    image: "/images/Pic2.png",
    category: "Matcha",
    collection: "Matcha",
    origin: "Japan",
    flavour: ["Grassy"],
    qualities: ["Energy"],
    caffeine: "High Caffeine",
    allergens: ["Lactose-free"],
    organic: true,
    stock: 20,
    tags: ["ceremonial", "umami", "vibrant", "premium"],
  },
  {
    name: "Red Bush Rooibos",
    description: "Naturally caffeine-free South African red bush tea with sweet, vanilla notes.",
    price: 19.5,
    image: "/images/Pic3.png",
    category: "Rooibos",
    collection: "Rooibos",
    origin: "South Africa",
    flavour: ["Sweet"],
    qualities: ["Relax"],
    caffeine: "No Caffeine",
    allergens: ["Nuts-free"],
    organic: true,
    stock: 40,
    tags: ["caffeine-free", "vanilla", "sweet", "african"],
  },
  {
    name: "Ceramic Tea Infuser Set",
    description: "Beautiful ceramic tea infuser with matching cup for the perfect brewing experience.",
    price: 35.0,
    image: "/images/Pic4.png",
    category: "Teaware",
    collection: "Teaware",
    origin: "Japan",
    flavour: ["Smooth"],
    qualities: ["Energy"],
    caffeine: "No Caffeine",
    allergens: ["Soy-free"],
    organic: false,
    stock: 15,
    tags: ["ceramic", "infuser", "brewing", "elegant"],
  },
  {
    name: "Tropical Fruit Blend",
    description: "Refreshing herbal blend with tropical fruits and hibiscus for a fruity experience.",
    price: 21.0,
    image: "/images/Pic5.png",
    category: "Herbal teas",
    collection: "Herbal teas",
    origin: "South Africa",
    flavour: ["Fruity"],
    qualities: ["Detox"],
    caffeine: "No Caffeine",
    allergens: ["Gluten-free"],
    organic: true,
    stock: 35,
    tags: ["tropical", "fruity", "hibiscus", "refreshing"],
  },
  {
    name: "Creamy Vanilla Chai",
    description: "Rich and creamy chai blend with vanilla notes and warming spices.",
    price: 26.5,
    image: "/images/Pic6.png",
    category: "Chai",
    collection: "Chai",
    origin: "India",
    flavour: ["Creamy"],
    qualities: ["Energy"],
    caffeine: "Medium Caffeine",
    allergens: ["Nuts-free"],
    organic: false,
    stock: 30,
    tags: ["creamy", "vanilla", "warming", "spiced"],
  },
  {
    name: "Detox Green Blend",
    description: "Cleansing green tea blend with herbs designed to support natural detoxification.",
    price: 28.0,
    image: "/images/Pic7.png",
    category: "Green teas",
    collection: "Green teas",
    origin: "Japan",
    flavour: ["Grassy"],
    qualities: ["Detox"],
    caffeine: "Low Caffeine",
    allergens: ["Soy-free"],
    organic: true,
    stock: 25,
    tags: ["detox", "cleansing", "herbs", "natural"],
  },
]

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tea-ecommerce")
    console.log("✅ Connected to MongoDB")

    await Product.deleteMany({})
    console.log("🗑️  Cleared existing products")

    const products = await Product.insertMany(sampleProducts)
    console.log(`📦 Inserted ${products.length} sample products`)

    console.log("\n🍃 Sample Tea Products:")
    console.log("=".repeat(50))
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Category: ${product.category} | Collection: ${product.collection}`)
      console.log(`   Price: $${product.price} | Stock: ${product.stock} | Caffeine: ${product.caffeine}`)
      console.log(`   Origin: ${product.origin} | Flavour: ${product.flavour.join(", ")} | Qualities: ${product.qualities.join(", ")}`)
      console.log(`   Allergens: ${product.allergens.join(", ")} | Organic: ${product.organic}`)
      console.log("")
    })

    console.log("🎉 Database seeding completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding products:", error.message)
    process.exit(1)
  }
}

process.on("SIGINT", async () => {
  console.log("\n⏹️  Seeding interrupted")
  await mongoose.connection.close()
  process.exit(0)
})

seedProducts()
