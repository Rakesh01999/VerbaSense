import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import auth, { AuthRequest } from '../middleware/auth';
import { transcribeAudio } from '../services/whisperService';
import Transcription from '../models/Transcription';

const router = express.Router();

// Configure Multer for audio uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.wav' && ext !== '.mp3') {
            return cb(new Error('Only .wav and .mp3 files are allowed'));
        }
        cb(null, true);
    }
});

// @route   POST api/transcribe
// @desc    Upload audio and transcribe
// @access  Private
router.post('/', [auth, upload.single('audio')], async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an audio file' });
    }

    try {
        const audioPath = req.file.path;
        const transcribedText = await transcribeAudio(audioPath);

        const newTranscription = new Transcription({
            user: (req.user as any)?.id || req.user, // Handle potential difference in payload structure
            audioUrl: audioPath,
            transcribedText,
            language: 'en', // Default or detected
            metadata: {
                size: req.file.size,
                format: req.file.mimetype
            }
        });

        const transcription = await newTranscription.save();
        res.json(transcription);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server error during transcription');
    }
});

// @route   GET api/transcribe/history
// @desc    Get user's transcription history
// @access  Private
router.get('/history', auth, async (req: AuthRequest, res: Response) => {
    try {
        const history = await Transcription.find({
            user: (req.user as any)?.id || req.user
        }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
