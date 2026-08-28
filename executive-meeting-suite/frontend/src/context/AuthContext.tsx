import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export interface User {
  id: string
  email: string
  role: 'CHIEF_OF_STAFF' | 'DIVISIONAL_HEAD' | 'VIEWER'
  fullName: string
  divisionId?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    const storedUser = sessionStorage.getItem('user')

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Login attempt for:', email)
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/auth/login`
      const response = await axios.post(apiUrl, {
        email,
        password
      })

      console.log('✅ Login successful, response:', response.data)
      const { token, user } = response.data
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      console.log('📍 About to setUser and setIsAuthenticated')
      setUser(user)
      setIsAuthenticated(true)

      console.log('🧭 About to navigate to /')
      navigate('/')
      console.log('✨ Login complete')
      return true
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data?.error || error.message)
      return false
    }
  }, [navigate])

  const logout = useCallback(() => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
