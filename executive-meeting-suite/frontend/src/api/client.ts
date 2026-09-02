import axios, { AxiosInstance } from 'axios'
import { ApiResponse } from '../types'

const client: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiCall = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await client({
      method,
      url,
      data
    })
    return response.data
  } catch (error: any) {
    return {
      success: false,
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'An error occurred',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

export default client
