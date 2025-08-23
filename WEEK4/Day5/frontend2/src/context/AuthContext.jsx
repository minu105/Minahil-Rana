"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from '../app/rtkRequest';
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
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(
    () => localStorage.getItem("redirectAfterLogin") || null
  )

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken) // <-- set token state
      api.setAuthToken(storedToken);
      checkAuthStatus(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuthStatus = async (storedToken) => {
    try {
      const response = await api.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      setUser(response.data.data.user)
    } catch (error) {
      localStorage.removeItem("token")
      api.setAuthToken(null);
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })

      const { token: newToken, user: newUser } = response.data.data
      localStorage.setItem("token", newToken)
      api.setAuthToken(newToken);
      setUser(newUser)
      setToken(newToken)

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
      const response = await api.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
      })

      const { token: newToken, user: newUser } = response.data.data
      localStorage.setItem("token", newToken)
      api.setAuthToken(newToken);
      setUser(newUser)
      setToken(newToken)

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
    api.setAuthToken(null);
    setUser(null)
    setToken(null)
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
    token,
    login,
    register,
    logout,
    loading,
    setRedirectUrl,
    getAndClearRedirectUrl,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
