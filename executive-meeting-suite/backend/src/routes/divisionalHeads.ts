import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { pool } from '../server';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Load divisional heads from config
const configPath = path.join(__dirname, '../../../config/divisional-heads.json');
const loadDivisionalHeads = () => {
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
};

// Get all divisions
router.get('/divisions', async (req: Request, res: Response) => {
  try {
    const config = loadDivisionalHeads();
    res.json({
      divisions: config.divisions,
      total: config.divisions.length
    });
  } catch (error: any) {
    console.error('Error loading divisions:', error);
    res.status(500).json({ error: 'Failed to load divisions' });
  }
});

// Get division by ID
router.get('/divisions/:id', async (req: Request, res: Response) => {
  try {
    const config = loadDivisionalHeads();
    const division = config.divisions.find((d: any) => d.id === req.params.id);

    if (!division) {
      return res.status(404).json({ error: 'Division not found' });
    }

    res.json(division);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load division' });
  }
});

// Add or update division
router.post('/divisions', async (req: Request, res: Response) => {
  try {
    const { id, name, company, description, heads } = req.body;

    if (!name || !company) {
      return res.status(400).json({ error: 'Name and company are required' });
    }

    const config = loadDivisionalHeads();
    const existingIndex = config.divisions.findIndex((d: any) => d.id === id);

    const divisionData = {
      id: id || `div-${Date.now()}`,
      name,
      company,
      description,
      heads: heads || []
    };

    if (existingIndex > -1) {
      config.divisions[existingIndex] = divisionData;
    } else {
      config.divisions.push(divisionData);
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Sync to database
    await pool.query(
      `INSERT INTO divisions (id, name, company, description) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name = $2, company = $3, description = $4`,
      [divisionData.id, name, company, description]
    );

    res.status(201).json({
      message: 'Division saved successfully',
      division: divisionData
    });
  } catch (error: any) {
    console.error('Error saving division:', error);
    res.status(500).json({ error: 'Failed to save division' });
  }
});

// Delete division
router.delete('/divisions/:id', async (req: Request, res: Response) => {
  try {
    const config = loadDivisionalHeads();
    const index = config.divisions.findIndex((d: any) => d.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Division not found' });
    }

    config.divisions.splice(index, 1);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Delete from database
    await pool.query('DELETE FROM divisions WHERE id = $1', [req.params.id]);

    res.json({ message: 'Division deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete division' });
  }
});

// Get divisional heads
router.get('/heads', async (req: Request, res: Response) => {
  try {
    const config = loadDivisionalHeads();
    const allHeads = config.divisions.flatMap((d: any) =>
      d.heads.map((h: any) => ({ ...h, divisionId: d.id, company: d.company }))
    );
    res.json({
      heads: allHeads,
      total: allHeads.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load heads' });
  }
});

// Add divisional head
router.post('/heads', async (req: Request, res: Response) => {
  try {
    const { divisionId, name, title, email, phone } = req.body;

    if (!divisionId || !name || !email) {
      return res.status(400).json({ error: 'Division ID, name, and email are required' });
    }

    const config = loadDivisionalHeads();
    const division = config.divisions.find((d: any) => d.id === divisionId);

    if (!division) {
      return res.status(404).json({ error: 'Division not found' });
    }

    const headId = `head-${Date.now()}`;
    const newHead = { id: headId, name, title, email, phone, department: 'Executive Office' };

    division.heads.push(newHead);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    res.status(201).json({
      message: 'Divisional head added successfully',
      head: { ...newHead, divisionId }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add divisional head' });
  }
});

export default router;
