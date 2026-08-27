// Action Item Business Logic Service

import { pool } from '../config/database'
import { AppError } from '../middleware/errorHandler'

export const actionItemService = {
  async getAll(userId: string, role: string) {
    // Get action items with responsible person and division details
    let query = `
      SELECT
        ai.id, ai.action_item_number, ai.meeting_id, ai.title, ai.description, ai.priority, ai.status,
        ai.target_date, ai.responsible_user_id, ai.responsible_division_id,
        ai.created_by, ai.created_at, ai.updated_at,
        u.full_name, u.email,
        d.name as division_name,
        m.meeting_number, m.title as meeting_title
      FROM action_items ai
      LEFT JOIN users u ON ai.responsible_user_id = u.id
      LEFT JOIN divisions d ON ai.responsible_division_id = d.id
      LEFT JOIN meetings m ON ai.meeting_id = m.id
      ORDER BY ai.target_date ASC
    `
    let params: any[] = []

    // Non-chief staff only see their assigned items
    if (role !== 'CHIEF_OF_STAFF') {
      query = `
        SELECT
          ai.id, ai.meeting_id, ai.title, ai.description, ai.priority, ai.status,
          ai.target_date, ai.responsible_person_id, ai.division_id, ai.company_id,
          ai.created_by, ai.created_at, ai.updated_at,
          u.full_name, u.email,
          d.name as division_name,
          m.meeting_number, m.title as meeting_title
        FROM action_items ai
        LEFT JOIN users u ON ai.responsible_person_id = u.id
        LEFT JOIN divisions d ON u.division_id = d.id
        LEFT JOIN meetings m ON ai.meeting_id = m.id
        WHERE ai.responsible_person_id = $1
        ORDER BY ai.target_date ASC
      `
      params = [userId]
    }

    const result = await pool.query(query, params)
    return result.rows
  },

  async getById(id: string) {
    const result = await pool.query(
      `SELECT
        ai.id, ai.meeting_id, ai.title, ai.description, ai.priority, ai.status,
        ai.target_date, ai.responsible_person_id, ai.division_id, ai.company_id,
        ai.created_by, ai.created_at, ai.updated_at,
        u.full_name, u.email,
        d.name as division_name,
        m.meeting_number, m.title as meeting_title
      FROM action_items ai
      LEFT JOIN users u ON ai.responsible_person_id = u.id
      LEFT JOIN divisions d ON u.division_id = d.id
      LEFT JOIN meetings m ON ai.meeting_id = m.id
      WHERE ai.id = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      throw new AppError(404, 'Action item not found')
    }
    return result.rows[0]
  },

  async create(data: any, userId: string) {
    const {
      meeting_id,
      title,
      description,
      priority,
      target_date,
      responsible_person_id,
      division_id,
      company_id
    } = data

    if (!title || !target_date || !responsible_person_id) {
      throw new AppError(422, 'Title, target date, and responsible person required')
    }

    // Verify responsible person exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [responsible_person_id])
    if (userCheck.rows.length === 0) {
      throw new AppError(404, 'Responsible person not found')
    }

    const result = await pool.query(
      `INSERT INTO action_items (
        meeting_id, title, description, priority, target_date,
        responsible_person_id, division_id, company_id, created_by, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'OPEN')
       RETURNING *`,
      [
        meeting_id,
        title,
        description,
        priority || 'HIGH',
        target_date,
        responsible_person_id,
        division_id,
        company_id,
        userId
      ]
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
