// Action Item Business Logic Service

import { pool } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export const actionItemService = {
  async getAll(userId: string, role: string) {
    let query = 'SELECT * FROM action_items ORDER BY target_date ASC'
    let params: any[] = []

    // Non-chief staff only see their items
    if (role !== 'CHIEF_OF_STAFF') {
      query = 'SELECT * FROM action_items WHERE responsible_user_id = $1 ORDER BY target_date ASC'
      params = [userId]
    }

    const result = await pool.query(query, params)
    return result.rows
  },

  async getById(id: string) {
    const result = await pool.query('SELECT * FROM action_items WHERE id = $1', [id])
    if (result.rows.length === 0) {
      throw new AppError(404, 'Action item not found')
    }
    return result.rows[0]
  },

  async create(data: any, userId: string) {
    const { meeting_id, title, description, priority, target_date, responsible_user_id, responsible_division_id } = data

    if (!title || !target_date) {
      throw new AppError(422, 'Title and target date required')
    }

    const result = await pool.query(
      `INSERT INTO action_items (meeting_id, title, description, priority, target_date, responsible_user_id, responsible_division_id, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN')
       RETURNING *`,
      [meeting_id, title, description, priority || 'MEDIUM', target_date, responsible_user_id, responsible_division_id, userId]
    )
    return result.rows[0]
  },

  async updateStatus(id: string, status: string, userId: string) {
    if (!['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CLOSED'].includes(status)) {
      throw new AppError(422, 'Invalid status')
    }

    const result = await pool.query(
      'UPDATE action_items SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    )

    if (result.rows.length === 0) {
      throw new AppError(404, 'Action item not found')
    }
    return result.rows[0]
  },

  async delete(id: string, userId: string) {
    const result = await pool.query(
      'DELETE FROM action_items WHERE id = $1 AND created_by = $2 RETURNING id',
      [id, userId]
    )

    if (result.rows.length === 0) {
      throw new AppError(403, 'Not authorized or action item not found')
    }
    return { deleted: true }
  }
}
