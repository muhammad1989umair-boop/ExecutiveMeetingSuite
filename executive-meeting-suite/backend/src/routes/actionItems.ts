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

    // Send email asynchronously (non-blocking)
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

      // Send email without awaiting, but handle errors properly
      (async () => {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@executivemeeting.local',
            to: responsible.email,
            subject: `Action Item: ${title}`,
            text: emailBody
          });

          await pool.query(
            'INSERT INTO email_logs (action_item_id, recipient_email, subject, status) VALUES ($1, $2, $3, $4)',
            [actionItem.id, responsible.email, `Action Item: ${title}`, 'SENT']
          );
        } catch (err: any) {
          console.error('Email send error:', err);
          pool.query(
            'INSERT INTO email_logs (action_item_id, recipient_email, subject, status, error_message) VALUES ($1, $2, $3, $4, $5)',
            [actionItem.id, responsible.email, `Action Item: ${title}`, 'FAILED', err.message]
          ).catch(() => {});
        }
      })();
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
    const conditions: string[] = [];

    // Filter by meetingId if provided
    if (req.query.meetingId) {
      conditions.push(`ai.meeting_id = $${params.length + 1}`);
      params.push(req.query.meetingId);
    }

    // If user is a divisional head, only show their items
    if (req.user?.role === 'DIVISIONAL_HEAD') {
      conditions.push(`ai.responsible_user_id = $${params.length + 1}`);
      params.push(req.user.id);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
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
    const { status, title, description, priority, targetDate } = req.body;
    const actionItemId = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Get the action item to check permissions
    const itemResult = await pool.query('SELECT * FROM action_items WHERE id = $1', [actionItemId]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Action item not found' });
    }

    const actionItem = itemResult.rows[0];
    const isResponsible = actionItem.responsible_user_id === userId;
    const isAdmin = userRole === 'CHIEF_OF_STAFF';

    // Permission checks for status changes
    if (status) {
      if (status === 'FOR_REVIEW') {
        // Responsible person or admin can mark for review
        if (!isResponsible && !isAdmin) {
          return res.status(403).json({ error: 'Only assigned person or admin can mark for review' });
        }
      } else if (status === 'CLOSED') {
        // Only admin can close
        if (!isAdmin) {
          return res.status(403).json({ error: 'Only admin can close action items' });
        }
      }
    }

    // Permission checks for updates
    if (title || description || priority || targetDate) {
      // Only responsible person or admin can update details
      if (!isResponsible && !isAdmin) {
        return res.status(403).json({ error: 'Only assigned person or admin can update' });
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (targetDate !== undefined) {
      updates.push(`target_date = $${paramCount++}`);
      values.push(new Date(targetDate));
    }
    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);

      if (status === 'CLOSED') {
        updates.push(`closed_at = CURRENT_TIMESTAMP`);
      }
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(actionItemId);

    const query = `UPDATE action_items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({
      message: 'Action item updated',
      actionItem: result.rows[0]
    });
  } catch (error: any) {
    console.error('PATCH action item error:', error.message, error);
    res.status(500).json({ error: 'Failed to update action item', details: error.message });
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
