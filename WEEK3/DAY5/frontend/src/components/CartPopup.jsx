"use client"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useEffect, useRef } from "react"

const CartPopup = ({ onClose }) => {
  const { cartItems, cartCount, getCartTotal, updateQuantity, removeFromCart } = useCart()
  const deliveryFee = 3.95
  const subtotal = getCartTotal()
  const total = subtotal + deliveryFee

  const popupRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  if (cartCount === 0) {
    return (
      <div className="fixed inset-0 z-50">
        {/* Gray overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Popup */}
        <div
          ref={popupRef}
          className="absolute top-0 right-0 w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 flex flex-col transition-colors"
        >
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My Bag</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8 sm:py-12">Your cart is empty</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Gray overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Popup */}
      <div
        ref={popupRef}
        className="absolute top-0 right-0 w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 flex flex-col transition-colors h-full sm:h-auto sm:max-h-screen"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My Bag</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-350px)] lg:max-h-[340px]">
          {cartItems.map((item) => (
            <div key={item.product._id} className="flex items-start justify-between gap-3">
              <img
                src={`${API_BASE_URL}${item.product.image}`}
                alt={item.product.name}
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.product.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  chai tea - {item.product.weight || "50 g"}
                </p>
                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="text-xs text-gray-800 dark:text-gray-300 mt-1 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  REMOVE
                </button>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        removeFromCart(item.product._id)
                      } else {
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                    }}
                    className="w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white rounded transition-colors"
                  >
                    -
                  </button>
                  <span className="text-sm min-w-[20px] text-center text-gray-900 dark:text-gray-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white rounded transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">€{item.product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky bottom summary */}
        <div className="p-4 sm:p-6 space-y-2 text-sm border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
            <span className="text-gray-900 dark:text-gray-100">€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Delivery</span>
            <span className="text-gray-900 dark:text-gray-100">€{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <span className="text-gray-900 dark:text-gray-100">Total</span>
            <span className="text-gray-900 dark:text-gray-100">€{total.toFixed(2)}</span>
          </div>

          {/* Purchase button */}
          <Link to="/cart" onClick={onClose}>
            <button className="mt-4 w-full bg-black dark:bg-gray-700 text-white py-3 text-sm font-medium tracking-wide hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors rounded">
              PURCHASE
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CartPopup
