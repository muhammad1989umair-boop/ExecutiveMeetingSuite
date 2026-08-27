// Meeting Business Logic Service

import { pool } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export const meetingService = {
  async getAll(userId: string) {
    const result = await pool.query(
      'SELECT * FROM meetings ORDER BY date DESC',
      []
    )
    return result.rows
  },

  async getById(id: string) {
    const result = await pool.query('SELECT * FROM meetings WHERE id = $1', [id])
    if (result.rows.length === 0) {
      throw new AppError(404, 'Meeting not found')
    }
    return result.rows[0]
  },

  async create(data: any, userId: string) {
    const { title, date, location, description, attendees } = data

    if (!title || !date) {
      throw new AppError(422, 'Title and date required')
    }

    const result = await pool.query(
      `INSERT INTO meetings (title, date, location, description, attendees, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, date, location, description, JSON.stringify(attendees || []), userId]
    )
    return result.rows[0]
  },

  async update(id: string, data: any, userId: string) {
    const { title, date, location, description } = data

    const result = await pool.query(
      `UPDATE meetings
       SET title = $1, date = $2, location = $3, description = $4
       WHERE id = $5 AND created_by = $6
       RETURNING *`,
      [title, date, location, description, id, userId]
    )

    if (result.rows.length === 0) {
      throw new AppError(403, 'Not authorized or meeting not found')
    }
    return result.rows[0]
  },

  async delete(id: string, userId: string) {
    const result = await pool.query(
      'DELETE FROM meetings WHERE id = $1 AND created_by = $2 RETURNING id',
      [id, userId]
    )

    if (result.rows.length === 0) {
      throw new AppError(403, 'Not authorized or meeting not found')
    }
    return { deleted: true }
  }
}
