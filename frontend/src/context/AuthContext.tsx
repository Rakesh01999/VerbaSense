"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: string
  email: string
  name?: string
  date?: string
}

interface UserStats {
  totalTranscriptions: number
  totalMinutes: number
  averageAccuracy: number
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
  stats: UserStats | null
  token: string | null
  isLoading: boolean
  login: (token: string, profile?: Partial<User>) => void
  logout: () => void
  refreshUser: () => Promise<void>
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
  const [stats, setStats] = useState<UserStats | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('token') || token
    if (!currentToken) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })
      const result = await response.json()
      if (result.success) {
        setUser(result.data.user)
        setStats(result.data.stats)
        localStorage.setItem('user', JSON.stringify(result.data.user))
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      const decoded = decodeUser(storedToken)
      if (decoded) {
        setToken(storedToken)
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch (e) {
            console.error('Error parsing stored user:', e)
          }
        }
        // Background refresh to get latest data
        refreshUser()
      } else {
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
    
    // Refresh user data immediately to get full profile and stats
    refreshUser()
    
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
    <AuthContext.Provider value={{ user, stats, token, isLoading, login, logout, refreshUser, isAuthenticated: !!token }}>
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
