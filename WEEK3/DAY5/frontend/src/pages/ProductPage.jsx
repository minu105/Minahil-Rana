"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

// Notification Component
const Notification = ({ message, onClose }) => {
  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-xl shadow-lg flex items-center space-x-4 animate-slideIn">
        <img src="/images/Bag.png" alt="cart" className="w-6 h-6 opacity-80 dark:opacity-60" />
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

const ProductPage = () => {
  const { id } = useParams()
  const location = useLocation()
  const { addToCart } = useCart()
  const { user, setRedirectUrl } = useAuth()
  const [product, setProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState("50g")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [notification, setNotification] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`)
      setProduct(response.data.data.product)
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      setRedirectUrl(location.pathname)
      alert("Please login to add items to cart.")
      return
    }

    setAddingToCart(true)
    const result = await addToCart(product._id, quantity)

    if (result.success) {
      setNotification(`${product.name} added to cart!`)
      setTimeout(() => setNotification(null), 3000)
    } else {
      setNotification(result.message)
      setTimeout(() => setNotification(null), 3000)
    }

    setAddingToCart(false)
  }

  const variants = [
    { id: "50g", label: "50 g bag", image: "/images/50.png" },
    { id: "100g", label: "100 g bag", image: "/images/100.png" },
    { id: "170g", label: "170 g bag", image: "/images/170.png" },
    { id: "250g", label: "250 g bag", image: "/images/250.png" },
    { id: "1kg", label: "1 kg bag", image: "/images/1kg.png" },
    { id: "sample", label: "Sampler", image: "/images/Sample.png" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-900 dark:text-white">Product not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="py-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm flex flex-wrap items-center">
            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              HOME
            </Link>
            <span className="mx-2 text-gray-600 dark:text-gray-400">/</span>
            <Link
              to="/collections"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              COLLECTIONS
            </Link>
            <span className="mx-2 text-gray-600 dark:text-gray-400">/</span>
            <Link
              to={`/collections/${product.collection?.toLowerCase().replace(" ", "-")}`}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {product.collection?.toUpperCase()}
            </Link>
            <span className="mx-2 text-gray-600 dark:text-gray-400">/</span>
            <span className="text-gray-800 dark:text-gray-200 uppercase">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 mb-16 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg">
            <img
              src={`http://localhost:3000/images/${product.image}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-8 lg:space-y-12">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {product.description || "A lovely warming Chai tea with ginger cinnamon flavours."}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 lg:space-x-16 text-sm text-gray-600 dark:text-gray-400 mt-8 mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <div className="mr-2 p-1 rounded-md bg-transparent dark:bg-white">
                    <img src="/images/World.png" alt="world" className="w-5 h-5 object-contain" />
                  </div>
                  <span className="font-medium">Origin: {product.origin || "Iran"}</span>
                </div>

                {product.organic && (
                  <div className="flex items-center">
                    <div className="mr-2 p-1 rounded-md bg-transparent dark:bg-white">
                      <img src="/images/Organic.png" alt="organic" className="w-5 h-5 object-contain" />
                    </div>
                    <span className="font-medium">Organic</span>
                  </div>
                )}

                <div className="flex items-center">
                  <div className="mr-2 p-1 rounded-md bg-transparent dark:bg-white">
                    <img src="/images/Vegan.png" alt="vegan" className="w-5 h-5 object-contain" />
                  </div>
                  <span className="font-medium">Vegan</span>
                </div>
              </div>

              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-10">
                €{product.price.toFixed(2)}
              </div>
            </div>

            {/* Variants */}
            <div>
              <h3 className="text-lg mb-2 text-gray-900 dark:text-white">Variants</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`text-center transition-colors border rounded-md p-2 ${
                      selectedVariant === variant.id
                        ? "border-yellow-500"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    <div
                      className={`mb-2 pt-2 flex justify-center p-2 rounded-md ${
                        selectedVariant === variant.id
                          ? "dark:bg-white"
                          : "bg-transparent dark:bg-white/90 hover:bg-gray-50 dark:hover:bg-white"
                      }`}
                    >
                      <img
                        src={variant.image || "/placeholder.svg"}
                        alt={variant.label}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                      />
                    </div>
                    <div className="text-xs sm:text-sm pb-2 text-gray-700 dark:text-gray-300">{variant.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  -
                </button>
                <span className="w-12 text-center text-lg text-gray-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-gray-800 dark:bg-gray-700 text-white py-3 px-6 font-medium hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-md"
              >
                {addingToCart ? (
                  "ADDING..."
                ) : (
                  <>
                    <img src="/images/Bag.png" alt="cart" className="w-4 h-4 inline-block opacity-80" />
                    ADD TO BAG
                  </>
                )}
              </button>
            </div>

            {/* Notification */}
            {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-12">
            {/* Steeping Instructions */}
            <div>
              <h3 className="text-3xl lg:text-4xl mb-10 text-gray-900 dark:text-white">Steeping instructions</h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <div className="mr-3 mb-3 p-1 rounded-md bg-transparent dark:bg-white">
                    <img src="/images/Kettle.png" alt="kettle" className="dark:opacity-100" />
                  </div>
                  <span className="pb-4 border-b-2 border-gray-400 dark:border-gray-600 flex-1">
                    <strong>SERVING SIZE:</strong> 2 tsp per cup, 6 tsp per pot
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="mr-3 mb-3 p-1 rounded-md bg-transparent dark:bg-white">
                    <img src="/images/Drop.png" alt="drop" className="dark:opacity-100" />
                  </div>
                  <span className="pb-4 border-b-2 border-gray-400 dark:border-gray-600 flex-1">
                    <strong>WATER TEMPERATURE:</strong> 100°C
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="mr-3 mb-3 p-1 rounded-md bg-transparent dark:bg-white">
                    <img src="/images/Clock.png" alt="clock" className="dark:opacity-100" />
                  </div>
                  <span className="pb-4 border-b-2 border-gray-400 dark:border-gray-600 flex-1">
                    <strong>STEEPING TIME:</strong> 3 - 5 minutes
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="mr-3 mb-3 p-1 rounded-md bg-transparent dark:bg-white">
                    <img src="/images/Circle.png" alt="circle" className="dark:opacity-100" />
                  </div>
                  <span className="pb-4 flex-1">
                    <strong>COLOR AFTER 3 MINUTES</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* About this tea */}
            <div>
              <h3 className="text-3xl lg:text-4xl mb-10 text-gray-900 dark:text-white">About this tea</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 text-sm divide-x divide-gray-300 dark:divide-gray-600 gap-4 lg:gap-0">
                <div className="px-0 lg:px-3">
                  <div className="uppercase text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">FLAVOR</div>
                  <div className="text-gray-800 dark:text-gray-200">Spicy</div>
                </div>
                <div className="px-0 lg:px-3">
                  <div className="uppercase text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">QUALITIES</div>
                  <div className="text-gray-800 dark:text-gray-200">Smoothing</div>
                </div>
                <div className="px-0 lg:px-3">
                  <div className="uppercase text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">CAFFEINE</div>
                  <div className="text-gray-800 dark:text-gray-200">Medium</div>
                </div>
                <div className="px-0 lg:px-3">
                  <div className="uppercase text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">ALLERGENS</div>
                  <div className="text-gray-800 dark:text-gray-200">Nuts-free</div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-3xl lg:text-4xl mb-8 text-gray-900 dark:text-white">Ingredient</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.ingredients ||
                    "Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-semibold text-center mb-12 text-gray-900 dark:text-white">You may also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Product 1 */}
          <div className="text-center">
            <img
              src="/images/Img1.png"
              alt="Ceylon Ginger Cinnamon chai tea"
              className="mx-auto w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
            <p className="mt-4 text-gray-900 dark:text-white">Ceylon Ginger</p>
            <p className="text-gray-900 dark:text-white">Cinnamon chai tea</p>
            <p className="mt-2 text-gray-800 dark:text-gray-200 font-medium">€4.85 / 50 g</p>
          </div>

          {/* Product 2 */}
          <div className="text-center">
            <img
              src="/images/Img2.png"
              alt="Ceylon Ginger Cinnamon chai tea"
              className="mx-auto w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
            <p className="mt-4 text-gray-900 dark:text-white">Ceylon Ginger</p>
            <p className="text-gray-900 dark:text-white">Cinnamon chai tea</p>
            <p className="mt-2 text-gray-800 dark:text-gray-200 font-medium">€4.85 / 50 g</p>
          </div>

          {/* Product 3 */}
          <div className="text-center">
            <img
              src="/images/Img3.png"
              alt="Ceylon Ginger Cinnamon chai tea"
              className="mx-auto w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
            <p className="mt-4 text-gray-900 dark:text-white">Ceylon Ginger</p>
            <p className="text-gray-900 dark:text-white">Cinnamon chai tea</p>
            <p className="mt-2 text-gray-800 dark:text-gray-200 font-medium">€4.85 / 50 g</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
