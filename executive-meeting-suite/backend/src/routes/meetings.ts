import { Router, Request, Response } from 'express';
import { pool } from '../database';
import { AuthRequest, authorize, authenticate } from '../middleware/auth';

const router = Router();

// Create meeting
router.post('/', authenticate, authorize(['CHIEF_OF_STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, meetingDate, location, participants, attendees } = req.body;

    if (!title || !meetingDate) {
      return res.status(400).json({ error: 'Title and meeting date required' });
    }

    // Use participants if provided, otherwise attendees
    const meetingAttendees = participants || attendees || [];

    const result = await pool.query(
      `INSERT INTO meetings (title, description, meeting_date, created_by, location, attendees)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, new Date(meetingDate), req.user?.id, location, meetingAttendees]
    );

    // Emit via WebSocket if needed

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Get all meetings
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.*,
        (SELECT COUNT(*) FROM action_items WHERE meeting_id = m.id AND status != 'CLOSED') as open_items,
        (SELECT COUNT(*) FROM action_items WHERE meeting_id = m.id AND status = 'CLOSED') as closed_items
       FROM meetings m
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
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.*,
        (SELECT COUNT(*) FROM action_items WHERE meeting_id = m.id AND status != 'CLOSED') as open_items
       FROM meetings m
       WHERE m.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(result.rows[0]);
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
