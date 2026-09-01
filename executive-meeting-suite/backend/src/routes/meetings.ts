import { Router, Request, Response } from 'express';
import { pool } from '../database';
import { AuthRequest, authorize, authenticate } from '../middleware/auth';

const router = Router();

// Create meeting
router.post('/', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, meetingDate, location, division, company, responsiblePerson, participants, attendees } = req.body;

    if (!title || !meetingDate) {
      return res.status(400).json({ error: 'Title and meeting date required' });
    }

    // Use participants if provided, otherwise attendees
    const meetingAttendees = participants || attendees || [];

    const result = await pool.query(
      `INSERT INTO meetings (title, description, meeting_date, created_by, location, division_id, company, responsible_person_id, attendees)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, new Date(meetingDate), req.user?.id, location, division || null, company || null, responsiblePerson || null, meetingAttendees]
    );

    // Emit via WebSocket if needed

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error creating meeting:', error.message || error);
    res.status(500).json({ error: 'Failed to create meeting', details: error.message });
  }
});

// Get all meetings
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.meeting_number, m.title, m.description, m.meeting_date, m.location, m.attendees,
              m.created_by, m.created_at, m.updated_at, m.division_id, m.company, m.responsible_person_id,
              d.name as division_name,
              u.full_name as responsible_person_name,
              COALESCE(SUM(CASE WHEN ai.status != 'CLOSED' THEN 1 ELSE 0 END), 0) as open_items,
              COALESCE(SUM(CASE WHEN ai.status = 'CLOSED' THEN 1 ELSE 0 END), 0) as closed_items
       FROM meetings m
       LEFT JOIN divisions d ON m.division_id = d.id
       LEFT JOIN users u ON m.responsible_person_id = u.id
       LEFT JOIN action_items ai ON m.id = ai.meeting_id
       GROUP BY m.id, m.meeting_number, m.title, m.description, m.meeting_date, m.location, m.attendees,
                m.created_by, m.created_at, m.updated_at, m.division_id, m.company, m.responsible_person_id,
                d.name, u.full_name
       ORDER BY m.meeting_date DESC
       LIMIT 100`
    );

    res.json({
      meetings: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load meetings' });
  }
});

// Get meeting by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.meeting_number, m.title, m.description, m.meeting_date, m.location, m.attendees,
              m.created_by, m.audio_url, m.audio_transcription, m.notes, m.created_at, m.updated_at,
              m.division_id, m.company, m.responsible_person_id,
              COALESCE(SUM(CASE WHEN ai.status != 'CLOSED' THEN 1 ELSE 0 END), 0) as open_items,
              COALESCE(SUM(CASE WHEN ai.status = 'CLOSED' THEN 1 ELSE 0 END), 0) as closed_items
       FROM meetings m
       LEFT JOIN action_items ai ON m.id = ai.meeting_id
       WHERE m.id = $1
       GROUP BY m.id, m.meeting_number, m.title, m.description, m.meeting_date, m.location, m.attendees,
                m.created_by, m.audio_url, m.audio_transcription, m.notes, m.created_at, m.updated_at,
                m.division_id, m.company, m.responsible_person_id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ meeting: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load meeting' });
  }
});

// Update meeting
router.patch('/:id', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, audioUrl, audioTranscription, notes } = req.body;
    const meetingId = req.params.id;

    const result = await pool.query(
      `UPDATE meetings
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           location = COALESCE($3, location),
           audio_url = COALESCE($4, audio_url),
           audio_transcription = COALESCE($5, audio_transcription),
           notes = COALESCE($6, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, description, location, audioUrl, audioTranscription, notes, meetingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }


    res.json({
      message: 'Meeting updated successfully',
      meeting: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// Get divisions and companies
router.get('/master-data/divisions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (name) id, name FROM divisions ORDER BY name`
    );
    res.json({ divisions: result.rows });
  } catch (error: any) {
    console.error('Error fetching divisions:', error.message);
    res.status(500).json({ error: 'Failed to fetch divisions' });
  }
});

// Get companies
router.get('/master-data/companies', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name FROM companies ORDER BY name`
    );
    res.json({ companies: result.rows.map((row: any) => ({ id: row.id, name: row.name })) });
  } catch (error: any) {
    console.error('Error fetching companies:', error.message);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Delete meeting
router.delete('/:id', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM meetings WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }


    res.json({ message: 'Meeting deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

// Upload audio
router.post('/:id/upload-audio', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { audioData } = req.body;
    const timestamp = Date.now();
    const fileName = `meeting-${req.params.id}-${timestamp}.wav`;

    // In production, save to cloud storage (S3, etc.)
    // For now, save locally
    const audioUrl = `/uploads/${fileName}`;

    const result = await pool.query(
      'UPDATE meetings SET audio_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [audioUrl, req.params.id]
    );

    res.json({
      message: 'Audio uploaded successfully',
      audioUrl,
      meeting: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

export default router;
