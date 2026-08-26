import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../server';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Accept audio and document files
    const allowedMimes = [
      'audio/wav', 'audio/mpeg', 'audio/mp4',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload file for action item response
router.post('/response/:actionItemId', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Update response with file URL
    const result = await pool.query(
      `UPDATE action_item_responses
       SET file_url = $1
       WHERE action_item_id = $2 AND submitted_by = $3
       RETURNING *`,
      [fileUrl, req.params.actionItemId, req.user?.id]
    );

    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      response: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload audio recording
router.post('/audio/:meetingId', upload.single('audio'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const audioUrl = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE meetings
       SET audio_url = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [audioUrl, req.params.meetingId]
    );

    res.json({
      message: 'Audio uploaded successfully',
      audioUrl,
      meeting: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error uploading audio:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

export default router;
