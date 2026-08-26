import { Router, Request, Response } from 'express';
import { pool } from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all users (divisional heads for assignment)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, title, role, division_id
       FROM users
       WHERE is_active = true
       ORDER BY full_name`
    );

    res.json({
      users: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// Get divisional heads only
router.get('/divisional-heads', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, title, role, division_id
       FROM users
       WHERE is_active = true AND (role = 'DIVISIONAL_HEAD' OR role = 'CHIEF_OF_STAFF')
       ORDER BY full_name`
    );

    res.json({
      users: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load divisional heads' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, title, role, division_id, is_active
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load user' });
  }
});

// Create user (admin only)
router.post('/', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { email, fullName, title, role, divisionId } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ error: 'Email and full name required' });
    }

    // User will be created through registration, this endpoint is just for reference
    res.status(400).json({ error: 'Use registration endpoint instead' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user profile
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, title } = req.body;
    const userId = req.params.id;

    // Users can only update their own profile
    if (req.user?.id !== userId && req.user?.role !== 'CHIEF_OF_STAFF') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           title = COALESCE($2, title),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, email, full_name, title, role, division_id`,
      [fullName, title, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Deactivate user (admin only)
router.patch('/:id/deactivate', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      `UPDATE users
       SET is_active = false,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, full_name, is_active`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deactivated successfully',
      user: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

export default router;
