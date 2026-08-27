// Authentication Service - Centralized logic

import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { pool } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export const authService = {
  async login(email: string, password: string) {
    const result = await pool.query(
      'SELECT id, email, password_hash, role, division_id, full_name FROM users WHERE email = $1 AND is_active = true',
      [email]
    )

    if (result.rows.length === 0) {
      throw new AppError(401, 'Invalid credentials')
    }

    const user = result.rows[0]
    const validPassword = await bcryptjs.compare(password, user.password_hash)

    if (!validPassword) {
      throw new AppError(401, 'Invalid credentials')
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        divisionId: user.division_id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    }
  },

  async getCurrentUser(userId: string) {
    const result = await pool.query(
      'SELECT id, email, full_name, role, division_id FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      throw new AppError(404, 'User not found')
    }

    return result.rows[0]
  }
}
