// Standardized API Response Format

export interface ApiResponse<T = any> {
  success: boolean
  status: number
  message: string
  data?: T
  error?: string
  timestamp: string
}

export const successResponse = <T>(
  data: T,
  message: string = 'Success',
  status: number = 200
): ApiResponse<T> => ({
  success: true,
  status,
  message,
  data,
  timestamp: new Date().toISOString()
})

export const errorResponse = (
  message: string,
  error?: any,
  status: number = 400
): ApiResponse => ({
  success: false,
  status,
  message,
  error: error?.message || error?.toString(),
  timestamp: new Date().toISOString()
})

export const notFoundResponse = (resource: string): ApiResponse => ({
  success: false,
  status: 404,
  message: `${resource} not found`,
  timestamp: new Date().toISOString()
})

export const unauthorizedResponse = (): ApiResponse => ({
  success: false,
  status: 401,
  message: 'Unauthorized',
  timestamp: new Date().toISOString()
})

export const validationError = (message: string, details?: any): ApiResponse => ({
  success: false,
  status: 422,
  message,
  error: details?.toString(),
  timestamp: new Date().toISOString()
})
