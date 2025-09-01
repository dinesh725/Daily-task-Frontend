"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import api from "../utils/api"

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
  const [error, setError] = useState(null)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (token && userData) {
        try {
          // Verify token is still valid
          const response = await api.get("/auth/verify")
          if (response.data.valid) {
            setUser(JSON.parse(userData))
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`
          } else {
            // Token is invalid, clear local storage
            localStorage.removeItem("token")
            localStorage.removeItem("user")
          }
        } catch (error) {
          console.error("Auth verification failed:", error)
          // Clear invalid auth data
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    setError(null)
    try {
      const response = await api.post("/auth/login", { email, password })
      const { token, user: userData } = response.data

      // Store token and user data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(userData))
      
      // Set default auth header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      
      // Update state
      setUser(userData)
      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || "Login failed. Please check your credentials."
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    setError(null)
    try {
      const response = await api.post("/auth/register", userData)
      const { token, user: newUser } = response.data

      // Store token and user data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(newUser))
      
      // Set default auth header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      
      // Update state
      setUser(newUser)
      toast.success("Registration successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed. Please try again."
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    // Clear local storage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    // Clear auth header
    delete api.defaults.headers.common["Authorization"]
    
    // Update state
    setUser(null)
    toast.success("Successfully logged out")
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
