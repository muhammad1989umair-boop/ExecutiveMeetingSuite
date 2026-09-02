import { Router, Request, Response } from 'express';
import { pool } from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import bcryptjs from 'bcryptjs';

const router = Router();

// Get all users (divisional heads for assignment)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, title, role, division_id, phone
       FROM users
       WHERE status = 'ACTIVE'
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
      `SELECT u.id, u.email, u.full_name, u.title, u.role, u.division_id, u.phone, d.name as division_name, d.company
       FROM users u
       LEFT JOIN divisions d ON u.division_id = d.id
       WHERE u.is_active = true AND (u.role = 'DIVISIONAL_HEAD' OR u.role = 'CHIEF_OF_STAFF')
       ORDER BY u.full_name`
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

// Create divisional head (admin only)
router.post('/', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { email, fullName, title, divisionId, password, phone } = req.body;

    if (!email || !fullName || !title || !divisionId || !phone) {
      return res.status(400).json({ error: 'Email, full name, title, division, and phone are required' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Verify division exists
    const divisionCheck = await pool.query(
      'SELECT id FROM divisions WHERE id = $1',
      [divisionId]
    );

    if (divisionCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Selected division does not exist' });
    }

    // Hash password with bcryptjs
    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, title, role, division_id, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
       RETURNING id, email, full_name, title, role, division_id, phone`,
      [email, hashedPassword, fullName, title, 'DIVISIONAL_HEAD', divisionId, phone]
    );

    res.json({
      message: 'Divisional head created successfully',
      user: result.rows[0]
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create divisional head: ' + error.message });
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
       SET status = 'INACTIVE',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, full_name, status`,
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
