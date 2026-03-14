"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: string
  email: string
  name?: string
}

interface JwtPayload {
  user: {
    id: string
  }
  exp: number
  iat: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, profile?: Partial<User>) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeUser(token: string): User | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    // Check if token has expired
    if (decoded.exp * 1000 < Date.now()) {
      return null
    }
    return {
      id: decoded.user.id,
      email: '', // Will be enriched from stored data
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      const decoded = decodeUser(storedToken)
      if (decoded) {
        // Merge decoded token info with stored user profile
        const storedUserObj = storedUser ? JSON.parse(storedUser) : {}
        setToken(storedToken)
        setUser({ ...decoded, ...storedUserObj })
      } else {
        // Token expired — clear it
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    setIsLoading(false)
  }, [])

  /**
   * Call this after a successful API login.
   * Pass the token and optionally user profile data (name, email).
   */
  const login = (newToken: string, profile?: Partial<User>) => {
    const decoded = decodeUser(newToken)
    if (!decoded) return

    const fullUser: User = { ...decoded, ...(profile || {}) }
    setToken(newToken)
    setUser(fullUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(fullUser))
    // Set cookie for middleware-level route protection
    document.cookie = `token=${newToken}; path=/; max-age=${60 * 60}; SameSite=Lax`
    router.push('/dashboard')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Clear the auth cookie
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
