import { useState, useCallback } from 'react'
import axios from 'axios'

// Use environment variable in production, localhost in development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_BASE = `${API_URL}/api`

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(async (method: string, url: string, data?: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios({
        method,
        url: `${API_BASE}${url}`,
        data,
        headers: {
          'Content-Type': 'application/json'
        }
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
