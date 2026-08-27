import { Router, Request, Response } from 'express';
import { pool } from '../database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all divisions
router.get('/divisions', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, company, description, created_at
       FROM divisions
       ORDER BY name ASC`
    );

    res.json({
      divisions: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching divisions:', error);
    res.status(500).json({ error: 'Failed to load divisions' });
  }
});

// Get all companies
router.get('/companies', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, created_at
       FROM companies
       ORDER BY name ASC`
    );

    res.json({
      companies: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to load companies' });
  }
});

// Add new division (admin only)
router.post('/divisions', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, company, description } = req.body;

    if (!name || !company) {
      return res.status(400).json({ error: 'Name and company are required' });
    }

    const result = await pool.query(
      `INSERT INTO divisions (name, company, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, company, description || null]
    );

    res.status(201).json({
      message: 'Division added successfully',
      division: result.rows[0]
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Division already exists' });
    }
    console.error('Error adding division:', error);
    res.status(500).json({ error: 'Failed to add division' });
  }
});

// Add new company (admin only)
router.post('/companies', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const result = await pool.query(
      `INSERT INTO companies (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name, description || null]
    );

    res.status(201).json({
      message: 'Company added successfully',
      company: result.rows[0]
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Company already exists' });
    }
    console.error('Error adding company:', error);
    res.status(500).json({ error: 'Failed to add company' });
  }
});

export default router;
