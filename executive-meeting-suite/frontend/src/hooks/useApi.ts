import { useState, useCallback } from 'react'
import axios from 'axios'

// Dynamically determine API URL based on current location
const getAPIURL = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) return envUrl

  // In development, API is on port 3000, frontend on 5000
  if (window.location.port === '5000') {
    return 'http://localhost:3000'
  }

  // In production, API is on same origin
  return window.location.protocol + '//' + window.location.host
}

const API_URL = getAPIURL()
const API_BASE = `${API_URL}/api`

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(async (method: string, url: string, data?: any) => {
    try {
      setLoading(true)
      setError(null)

      const headers: any = {
        'Content-Type': 'application/json'
      }

      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await axios({
        method,
        url: `${API_BASE}${url}`,
        data,
        headers
      })

      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    request,
    get: (url: string) => request('GET', url),
    post: (url: string, data: any) => request('POST', url, data),
    patch: (url: string, data: any) => request('PATCH', url, data),
    delete: (url: string) => request('DELETE', url)
  }
}
