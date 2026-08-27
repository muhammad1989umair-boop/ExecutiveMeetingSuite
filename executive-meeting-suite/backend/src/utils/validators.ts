// Input Validation Utilities

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password && password.length >= 6
}

export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== ''
}

export const validate = (rules: Record<string, boolean>) => {
  const errors: string[] = []
  for (const [key, isValid] of Object.entries(rules)) {
    if (!isValid) errors.push(key)
  }
  return errors.length > 0 ? errors : null
}

export class ValidationError extends Error {
  constructor(public fields: string[]) {
    super(`Validation failed for: ${fields.join(', ')}`)
    this.name = 'ValidationError'
  }
}
