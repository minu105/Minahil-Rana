"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api } from "@/services/api"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/profile")
      setUser(response.data.data.user)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.post("/users/login", { email, password })
    const { user: userData, token: userToken } = response.data.data

    setUser(userData)
    setToken(userToken)
    localStorage.setItem("token", userToken)
    api.defaults.headers.common["Authorization"] = `Bearer ${userToken}`
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/users/register", { name, email, password })
    const { user: userData, token: userToken } = response.data.data

    setUser(userData)
    setToken(userToken)
    localStorage.setItem("token", userToken)
    api.defaults.headers.common["Authorization"] = `Bearer ${userToken}`
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
