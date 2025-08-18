"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(
    () => localStorage.getItem("redirectAfterLogin") || null
  )

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      checkAuthStatus()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`)
      setUser(response.data.data.user)
    } catch (error) {
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })

      const { token, user } = response.data.data
      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
      })

      const { token, user } = response.data.data
      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("redirectAfterLogin")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    setRedirectAfterLogin(null)
  }

  const setRedirectUrl = (url) => {
    setRedirectAfterLogin(url)
    localStorage.setItem("redirectAfterLogin", url)
  }

  const getAndClearRedirectUrl = () => {
    const url = redirectAfterLogin || localStorage.getItem("redirectAfterLogin")
    setRedirectAfterLogin(null)
    localStorage.removeItem("redirectAfterLogin")
    return url
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    setRedirectUrl,
    getAndClearRedirectUrl,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
