import { useState, useCallback } from 'react'
import axios from 'axios'

const API_BASE = '/api'

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
