import { Router, Request, Response } from 'express';
import { pool } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get dashboard metrics
router.get('/metrics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const totalActions = await pool.query(
      'SELECT COUNT(*) as count FROM action_items'
    );

    const openActions = await pool.query(
      "SELECT COUNT(*) as count FROM action_items WHERE status::text = 'OPEN' OR status::text = 'IN_PROGRESS' OR status::text = 'PENDING_REVIEW' OR status::text = 'FOR_REVIEW'"
    );

    const closedActions = await pool.query(
      "SELECT COUNT(*) as count FROM action_items WHERE status::text = 'CLOSED'"
    );

    const pendingReview = await pool.query(
      "SELECT COUNT(*) as count FROM action_items WHERE status::text = 'PENDING_REVIEW'"
    );

    const forReview = await pool.query(
      "SELECT COUNT(*) as count FROM action_items WHERE status::text = 'FOR_REVIEW'"
    );

    const overdue = await pool.query(
      "SELECT COUNT(*) as count FROM action_items WHERE target_date < CURRENT_TIMESTAMP AND status::text != 'CLOSED'"
    );

    const byPriority = await pool.query(
      `SELECT priority, COUNT(*) as count
       FROM action_items
       WHERE status != 'CLOSED'
       GROUP BY priority`
    );

    const byDivision = await pool.query(
      `SELECT d.name, COUNT(ai.id) as count
       FROM action_items ai
       JOIN divisions d ON ai.responsible_division_id = d.id
       WHERE ai.status != 'CLOSED'
       GROUP BY d.name`
    );

    const byCompany = await pool.query(
      `SELECT c.name as company, COUNT(DISTINCT ai.id) as count
       FROM companies c
       JOIN meetings m ON (m.company = c.name OR m.company = c.id::text)
       JOIN action_items ai ON ai.meeting_id = m.id AND ai.status != 'CLOSED'
       GROUP BY c.id, c.name
       HAVING COUNT(DISTINCT ai.id) > 0
       ORDER BY count DESC`
    );

    const byResponsiblePerson = await pool.query(
      `SELECT u.full_name, COUNT(ai.id) as count
       FROM action_items ai
       JOIN users u ON ai.responsible_user_id = u.id
       WHERE ai.status != 'CLOSED'
       GROUP BY u.full_name`
    );

    const byAging = await pool.query(
      `SELECT
        CASE
          WHEN CURRENT_TIMESTAMP - target_date >= interval '30 days' THEN '30+ days overdue'
          WHEN CURRENT_TIMESTAMP - target_date >= interval '15 days' THEN '15-29 days overdue'
          WHEN CURRENT_TIMESTAMP - target_date >= interval '7 days' THEN '7-14 days overdue'
          WHEN CURRENT_TIMESTAMP - target_date >= interval '1 day' THEN '1-6 days overdue'
        END as days,
        COUNT(ai.id) as count
       FROM action_items ai
       WHERE ai.status != 'CLOSED' AND target_date < CURRENT_TIMESTAMP
       GROUP BY days
       ORDER BY days DESC`
    );

    res.json({
      metrics: {
        totalActions: parseInt(totalActions.rows[0].count),
        openActions: parseInt(openActions.rows[0].count),
        closedActions: parseInt(closedActions.rows[0].count),
        pendingReview: parseInt(pendingReview.rows[0].count),
        forReview: parseInt(forReview.rows[0].count),
        overdueActions: parseInt(overdue.rows[0].count),
        completionRate: totalActions.rows[0].count > 0
          ? ((closedActions.rows[0].count / totalActions.rows[0].count) * 100).toFixed(2)
          : 0
      },
      byPriority: byPriority.rows.map(row => ({
        priority: row.priority,
        count: parseInt(row.count)
      })),
      byDivision: byDivision.rows.map(row => ({
        division: row.name,
        count: parseInt(row.count)
      })),
      byCompany: byCompany.rows.map(row => ({
        company: row.company,
        count: parseInt(row.count)
      })),
      byResponsiblePerson: byResponsiblePerson.rows.map(row => ({
        full_name: row.full_name,
        count: parseInt(row.count)
      })),
      byAging: byAging.rows.map(row => ({
        days: row.days,
        count: parseInt(row.count)
      }))
    });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to load metrics' });
  }
});

// Get action items timeline
router.get('/timeline', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('day', target_date) as date, COUNT(*) as count
       FROM action_items
       WHERE status != 'CLOSED'
       GROUP BY DATE_TRUNC('day', target_date)
       ORDER BY date ASC
       LIMIT 30`
    );

    res.json({
      timeline: result.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load timeline' });
  }
});

// Get recent activity
router.get('/activity', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT ai.*, u.full_name, d.name as division_name, m.title as meeting_title
       FROM action_items ai
       JOIN users u ON ai.responsible_user_id = u.id
       JOIN divisions d ON ai.responsible_division_id = d.id
       JOIN meetings m ON ai.meeting_id = m.id
       ORDER BY ai.updated_at DESC
       LIMIT 20`
    );

    res.json({
      activities: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

export default router;
