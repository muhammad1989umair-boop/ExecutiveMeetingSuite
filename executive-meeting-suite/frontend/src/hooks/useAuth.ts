import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export interface User {
  id: string
  email: string
  role: 'CHIEF_OF_STAFF' | 'DIVISIONAL_HEAD' | 'VIEWER'
  fullName: string
  divisionId?: string
}

export const useAuth = () => {
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
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/auth/login`
      const response = await axios.post(apiUrl, {
        email,
        password
      })

      const { token, user } = response.data
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      setIsAuthenticated(true)
      navigate('/')
      return true
    } catch (error: any) {
      console.error('Login failed:', error.response?.data?.error)
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

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  }
}
