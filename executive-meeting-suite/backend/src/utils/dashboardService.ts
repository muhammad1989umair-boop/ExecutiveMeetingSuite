// Dashboard Analytics Service

import { pool } from '../config/database'

export const dashboardService = {
  async getMetrics() {
    const result = await pool.query(`
      SELECT
        COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open_count,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_count,
        COUNT(*) as total_count
      FROM action_items
    `)
    return result.rows[0]
  },

  async getPriorityBreakdown() {
    const result = await pool.query(`
      SELECT priority, COUNT(*) as count
      FROM action_items
      GROUP BY priority
      ORDER BY priority
    `)
    return result.rows
  },

  async getDivisionBreakdown() {
    const result = await pool.query(`
      SELECT d.name, COUNT(ai.id) as count
      FROM divisions d
      LEFT JOIN action_items ai ON d.id = ai.responsible_division_id
      GROUP BY d.id, d.name
      ORDER BY count DESC
    `)
    return result.rows
  },

  async getRecentActivity() {
    const result = await pool.query(`
      SELECT id, title, status, created_at
      FROM action_items
      ORDER BY created_at DESC
      LIMIT 10
    `)
    return result.rows
  },

  async getTimeline() {
    const result = await pool.query(`
      SELECT DATE(target_date) as date, COUNT(*) as count
      FROM action_items
      WHERE target_date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(target_date)
      ORDER BY date
    `)
    return result.rows
  }
}
