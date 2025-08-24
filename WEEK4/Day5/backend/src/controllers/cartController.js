const Cart = require("../models/Cart")
const Product = require("../models/Product")

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price image stock"
    )
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
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

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      })
    }

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] })
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    )

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock available",
        })
      }

      cart.items[existingItemIndex].quantity = newQuantity
      cart.items[existingItemIndex].price = product.price
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
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

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    )

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      })
    }

    const product = await Product.findById(productId)
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      })
    }

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

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    )

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

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: { cart },
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
