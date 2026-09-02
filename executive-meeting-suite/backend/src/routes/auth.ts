import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

interface LoginRequest {
  email: string;
  password: string;
}

const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain number' };
  }
  return { valid: true };
};

// Login endpoint
router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, role, division_id, full_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    const validPassword = await bcryptjs.compare(password, user.password_hash);

    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        divisionId: user.division_id
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        divisionId: user.division_id
      }
    });
  } catch (error: any) {
    console.error('Login error:', error.message, error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Register endpoint (Chief of Staff only)
router.post('/register', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, fullName, title, role, divisionId } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Email, password, and full name required' });
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.error });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, title, role, division_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, full_name, division_id`,
      [email, hashedPassword, fullName, title, role || 'VIEWER', divisionId]
    );

    const user = result.rows[0];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        divisionId: user.division_id
      },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        divisionId: user.division_id
      },
      message: 'User registered successfully'
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Get current user
router.get('/me', authenticate, async (req: any, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, title, role, division_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      title: user.title,
      role: user.role,
      divisionId: user.division_id,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
