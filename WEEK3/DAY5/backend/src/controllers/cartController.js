const Cart = require("../models/Cart")
const Product = require("../models/Product")

// Get user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name price image stock")

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          cart: {
            items: [],
            totalAmount: 0,
          },
        },
      })
    }

    res.status(200).json({
      success: true,
      data: { cart },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message,
    })
  }
}

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    // Check if product exists and is active
    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      })
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock available",
        })
      }

      cart.items[existingItemIndex].quantity = newQuantity

      // 🔹 Always update price from latest product info
      cart.items[existingItemIndex].price = product.price

    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.price, // always fresh price
      })
    }

    await cart.save()
    await cart.populate("items.product", "name price image stock")

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: { cart },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    })
  }
}

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      })
    }

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      })
    }

    // Check stock availability
    const product = await Product.findById(productId)
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      })
    }

    // 🔹 Update quantity & always refresh price
    cart.items[itemIndex].quantity = quantity
    cart.items[itemIndex].price = product.price

    await cart.save()
    await cart.populate("items.product", "name price image stock")

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: { cart },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    })
  }
}

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId)

    await cart.save()
    await cart.populate("items.product", "name price image stock")

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: { cart },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    })
  }
}

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    cart.items = []
    cart.totalAmount = 0
    await cart.save()

    // Remove the cart from DB after clearing
    await Cart.deleteOne({ _id: cart._id })

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    })
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
}
