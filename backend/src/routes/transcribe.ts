import express from 'express';
import multer from 'multer';
import path from 'path';
import auth from '../middleware/auth';
import * as transcribeController from '../controllers/transcribeController';

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

// @route   POST api/transcribe - Upload audio and transcribe
router.post('/', [auth, upload.single('audio')], transcribeController.uploadAndTranscribe);

// @route   GET api/transcribe/history - Get user's transcription history
router.get('/history', auth, transcribeController.getHistory);

export default router;
