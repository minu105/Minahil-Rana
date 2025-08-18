"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  const ensureAuthHeaders = () => {
    const token = localStorage.getItem("token")
    if (token && !axios.defaults.headers.common["Authorization"]) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCartItems([])
      setCartCount(0)
    }
  }, [user])

  const fetchCart = async () => {
    if (!user) return

    try {
      setLoading(true)
      ensureAuthHeaders()
      const response = await axios.get(`${API_BASE_URL}/cart`)

      console.log("[v0] Cart fetch response:", response.data)

      // Try different response structures to match backend
      let items = []
      if (response.data.data?.cart?.items) {
        items = response.data.data.cart.items
      } else if (response.data.cart?.items) {
        items = response.data.cart.items
      } else if (response.data.data?.items) {
        items = response.data.data.items
      } else if (response.data.items) {
        items = response.data.items
      }

      console.log("[v0] Processed cart items:", items)
      setCartItems(items)
      setCartCount(items.reduce((total, item) => total + item.quantity, 0))
    } catch (error) {
      console.error("Error fetching cart:", error)
      setCartItems([])
      setCartCount(0)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      return { success: false, message: "Please login to add items to cart" }
    }

    try {
      ensureAuthHeaders()
      const response = await axios.post(`${API_BASE_URL}/cart/add`, {
        productId,
        quantity,
      })

      await fetchCart()
      return { success: true, message: "Item added to cart" }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add item to cart",
      }
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (!user) return

    try {
      ensureAuthHeaders()
      await axios.put(`${API_BASE_URL}/cart/update`, {
        productId,
        quantity,
      })

      await fetchCart()
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  const removeFromCart = async (productId) => {
    if (!user) return

    try {
      ensureAuthHeaders()
      await axios.delete(`${API_BASE_URL}/cart/remove/${productId}`)
      await fetchCart()
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      ensureAuthHeaders()
      await axios.delete(`${API_BASE_URL}/cart/clear`)
      setCartItems([])
      setCartCount(0)
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity
    }, 0)
  }

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    fetchCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
