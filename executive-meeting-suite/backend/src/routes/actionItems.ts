import { Router, Request, Response } from 'express';
import { pool } from '../database';
import { AuthRequest, authorize, authenticate } from '../middleware/auth';
import nodemailer from 'nodemailer';

const router = Router();

// Setup email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'localhost',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Create action item
router.post('/', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId, title, description, responsibleUserId, responsibleDivisionId, priority, targetDate } = req.body;

    if (!meetingId || !title || !responsibleUserId || !targetDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO action_items (meeting_id, title, description, responsible_user_id, responsible_division_id, priority, target_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [meetingId, title, description, responsibleUserId, responsibleDivisionId, priority || 'MEDIUM', new Date(targetDate), req.user?.id]
    );

    const actionItem = result.rows[0];

    // Get responsible user email
    const userResult = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [responsibleUserId]);
    const responsible = userResult.rows[0];

    // Send email (fire and forget)
    if (responsible) {
      const emailBody = `
Dear ${responsible.full_name},

A new action item has been assigned to you:

Title: ${title}
Description: ${description}
Target Date: ${new Date(targetDate).toLocaleDateString()}
Priority: ${priority}

Please log in to the Executive Meeting Suite to view details and submit your response.

Best regards,
Chief of Staff
      `;

      transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@executivemeeting.local',
        to: responsible.email,
        subject: `Action Item: ${title}`,
        text: emailBody
      }).catch((err: any) => console.error('Email send error:', err));

      // Log email
      await pool.query(
        'INSERT INTO email_logs (action_item_id, recipient_email, subject, status) VALUES ($1, $2, $3, $4)',
        [actionItem.id, responsible.email, `Action Item: ${title}`, 'SENT']
      ).catch((err: any) => console.error('Email log error:', err));
    }

    res.status(201).json({
      message: 'Action item created',
      actionItem
    });
  } catch (error: any) {
    console.error('Error creating action item:', error);
    res.status(500).json({ error: 'Failed to create action item' });
  }
});

// Get action items
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let query = `SELECT ai.id, ai.action_item_number, ai.meeting_id, ai.title, ai.description, ai.priority, ai.status,
                        ai.target_date, ai.responsible_user_id, ai.responsible_division_id,
                        ai.created_by, ai.created_at, ai.updated_at,
                        u.full_name, u.email,
                        d.name as division_name,
                        m.meeting_number, m.title as meeting_title
                 FROM action_items ai
                 JOIN users u ON ai.responsible_user_id = u.id
                 JOIN divisions d ON ai.responsible_division_id = d.id
                 LEFT JOIN meetings m ON ai.meeting_id = m.id`;
    const params: any[] = [];

    // If user is a divisional head, only show their items
    if (req.user?.role === 'DIVISIONAL_HEAD') {
      query += ` WHERE ai.responsible_user_id = $1`;
      params.push(req.user.id);
    }

    query += ` ORDER BY ai.target_date ASC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({
      actionItems: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load action items' });
  }
});

// Get action item by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT ai.id, ai.action_item_number, ai.meeting_id, ai.title, ai.description, ai.priority, ai.status,
              ai.target_date, ai.responsible_user_id, ai.responsible_division_id,
              ai.created_by, ai.created_at, ai.updated_at,
              u.full_name, u.email,
              d.name as division_name,
              m.meeting_number, m.title as meeting_title
       FROM action_items ai
       JOIN users u ON ai.responsible_user_id = u.id
       JOIN divisions d ON ai.responsible_division_id = d.id
       LEFT JOIN meetings m ON ai.meeting_id = m.id
       WHERE ai.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action item not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load action item' });
  }
});

// Update action item status
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const actionItemId = req.params.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const query = status === 'CLOSED'
      ? `UPDATE action_items SET status = $1, closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`
      : `UPDATE action_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;

    const result = await pool.query(query, [status, actionItemId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action item not found' });
    }

    res.json({
      message: 'Action item updated',
      actionItem: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update action item' });
  }
});

// Submit response to action item
router.post('/:id/response', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { responseText } = req.body;
    const actionItemId = req.params.id;

    if (!responseText) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    const result = await pool.query(
      `INSERT INTO action_item_responses (action_item_id, submitted_by, response_text, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [actionItemId, req.user?.id, responseText, 'SUBMITTED']
    );

    // Update action item status to PENDING_REVIEW
    await pool.query(
      'UPDATE action_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['PENDING_REVIEW', actionItemId]
    );

    res.status(201).json({
      message: 'Response submitted successfully',
      response: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// Get responses for action item
router.get('/:id/responses', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM action_item_responses
       WHERE action_item_id = $1
       ORDER BY created_at DESC`,
      [req.params.id]
    );

    res.json({
      responses: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load responses' });
  }
});

// Delete action item (admin only)
router.delete('/:id', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM action_items WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action item not found' });
    }

    res.json({ message: 'Action item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting action item:', error);
    res.status(500).json({ error: 'Failed to delete action item' });
  }
});

export default router;
