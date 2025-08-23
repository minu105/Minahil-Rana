"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { ThemeToggle } from "./ThemeToggle"
import CartPopup from "./CartPopup"

const Navbar = () => {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const [showCartPopup, setShowCartPopup] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { clearCart } = useCart()
  
  const userMenuRef = useRef(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    clearCart()
    logout()
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/Logo.png" alt="Logo" className="w-8 h-8 p-1 dark:bg-white" />
            <span className="text-xl font-semibold text-gray-800 dark:text-gray-200 font-prosto">Brand Name</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/collections" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors">
              TEA COLLECTIONS
            </Link>
            <Link to="/accessories" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors">
              ACCESSORIES
            </Link>
            <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors">
              BLOG
            </Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors">
              CONTACT US
            </Link>

            {/* Users link visible only to admin/superadmin */}
            {(user?.role === "admin" || user?.role === "superadmin") && (
              <Link
                to={user.role === "superadmin" ? "/users" : "/users/customers"}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors"
              >
                USERS
              </Link>
            )}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <ThemeToggle />

            {/* Search */}
            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors cursor-pointer">
              <img src="/images/Search.png" alt="Search" className="w-5 h-5 dark:invert cursor-pointer" />
            </button>

            {/* User Account */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors cursor-pointer">
                  <img src="/images/Person.png" alt="User" className="w-5 h-5 dark:invert cursor-pointer" />
                </button>

                {(isUserMenuOpen || true) && (
                  <div
                    className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700 
                    transition-all duration-200 
                    ${isUserMenuOpen ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"}`}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                      Hello, {user.name}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                <img src="/images/Person.png" alt="Login" className="w-5 h-5 dark:invert cursor-pointer" />
              </Link>
            )}

            {/* Cart */}
            <div className="relative">
              <button
                onClick={() => setShowCartPopup(!showCartPopup)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 relative transition-colors"
              >
                <img src="/images/Cart.png" alt="Cart" className="w-5 h-5 mt-1 dark:invert cursor-pointer" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {showCartPopup && <CartPopup onClose={() => setShowCartPopup(false)} />}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col space-y-4">
              <Link to="/collections" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                TEA COLLECTIONS
              </Link>
              <Link to="/accessories" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                ACCESSORIES
              </Link>
              <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                BLOG
              </Link>
              <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                CONTACT US
              </Link>

              {/* Users link for mobile menu */}
              {(user?.role === "admin" || user?.role === "superadmin") && (
                <Link
                  to={user.role === "superadmin" ? "/users" : "/users/customers"}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  USERS
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
