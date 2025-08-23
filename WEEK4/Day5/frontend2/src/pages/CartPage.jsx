"use client"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://minahil-rana.vercel.app/api";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart()
  const { user } = useAuth()

  const deliveryFee = 3.95
  const subtotal = getCartTotal()
  const total = subtotal + deliveryFee

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Please Login</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You need to be logged in to view your cart.</p>
          <Link
            to="/login"
            className="bg-gray-800 dark:bg-gray-700 text-white px-6 py-3 hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors rounded-md"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Add some delicious teas to get started!</p>
          <Link
            to="/collections"
            className="bg-gray-800 dark:bg-gray-700 text-white px-6 py-3 hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors rounded-md"
          >
            Browse Teas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 text-sm w-full overflow-x-auto">
          {/* Step 1 */}
          <div className="flex items-center flex-1 min-w-0">
            <span className="text-black dark:text-white font-medium whitespace-nowrap mr-2 sm:mr-4 text-xs sm:text-sm">
              1. MY BAG
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600 min-w-4"></div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center flex-1 min-w-0">
            <span className="text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap mx-2 sm:mx-4 text-xs sm:text-sm">
              2. DELIVERY
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600 min-w-4"></div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center flex-1 min-w-0">
            <span className="text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap ml-2 sm:ml-4 text-xs sm:text-sm">
              3. REVIEW & PAYMENT
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center py-6 gap-4"
                >
                  <img
                    src={`${API_BASE_URL}${item.product.image}`}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      chai tea - {item.product.weight || "50 g"}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mt-1"
                    >
                      REMOVE
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.product._id, Math.max(0, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-medium text-gray-900 dark:text-white">€{item.product.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">€{subtotal.toFixed(2)}</span>
            </div>

            <div className="mt-6">
              <Link
                to="/collections"
                className="inline-block border border-gray-800 dark:border-gray-300 px-6 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-gray-900 dark:text-white"
              >
                BACK TO SHOPPING
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-10">
            {/* Price Summary */}
            <div className="bg-gray-100 dark:bg-gray-800 p-6 flex flex-col justify-between min-h-[250px] rounded-lg">
              <div>
                <h3 className="mb-4 text-gray-900 dark:text-white font-medium">Order summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-100">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-100">Delivery</span>
                    <span className="text-gray-900 dark:text-white">€{deliveryFee.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 dark:border-gray-300 mt-4 pt-4">
                <div className="flex justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-100">Total</span>
                  <span className="text-gray-900 dark:text-white font-medium">€{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Estimated shipping time: 2 days</p>
                <button className="w-full bg-black dark:bg-white text-white dark:text-black py-3 mt-4 mb-4 hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors rounded-md">
                  CHECK OUT
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-gray-100 dark:bg-gray-800 p-6 pb-8 rounded-lg">
              <h4 className="mb-4 text-gray-900 dark:text-white font-medium">Payment type</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                <img src="/images/Visa.png" alt="Visa" className="h-8" />
                <img src="/images/Mastercard.png" alt="Mastercard" className="h-8" />
                <img src="/images/Maestro.png" alt="Maestro" className="h-8" />
                <img src="/images/Deal.png" alt="iDEAL" className="h-8" />
                <img src="/images/Advance.png" alt="American Express" className="h-8" />
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-100 dark:bg-gray-800 p-6 pb-8 rounded-lg">
              <h4 className="mb-4 text-gray-900 dark:text-white font-medium">Delivery and retour</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-100">
                <li className="flex items-start">
                  <img src="/images/Arrow.png" className="mt-1 mr-2" />
                  Order before 12:00 and we will ship the same day.
                </li>
                <li className="flex items-start">
                  <img src="/images/Arrow.png" className="mt-1 mr-2" />
                  Orders made after Friday 12:00 are processed on Monday.
                </li>
                <li className="flex items-start">
                  <img src="/images/Arrow.png" className="mt-1 mr-2" />
                  To return your articles, please contact us first.
                </li>
                <li className="flex items-start">
                  <img src="/images/Arrow.png" className="mt-1 mr-2" />
                  Postal charges for retour are not reimbursed.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="my-16">
          <h2 className="text-2xl font-semibold text-center mb-12 text-gray-900 dark:text-white font-prosto">
            Popular this season
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
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
    </div>
  )
}

export default CartPage
