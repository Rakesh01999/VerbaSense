"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("../middleware/auth"));
const whisperService_1 = require("../services/whisperService");
const Transcription_1 = __importDefault(require("../models/Transcription"));
const router = express_1.default.Router();
// Configure Multer for audio uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (ext !== '.wav' && ext !== '.mp3') {
            return cb(new Error('Only .wav and .mp3 files are allowed'));
        }
        cb(null, true);
    }
});
// @route   POST api/transcribe
// @desc    Upload audio and transcribe
// @access  Private
router.post('/', [auth_1.default, upload.single('audio')], async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an audio file' });
    }
    try {
        const audioPath = req.file.path;
        const transcribedText = await (0, whisperService_1.transcribeAudio)(audioPath);
        const newTranscription = new Transcription_1.default({
            user: req.user?.id || req.user, // Handle potential difference in payload structure
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
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during transcription');
    }
});
// @route   GET api/transcribe/history
// @desc    Get user's transcription history
// @access  Private
router.get('/history', auth_1.default, async (req, res) => {
    try {
        const history = await Transcription_1.default.find({
            user: req.user?.id || req.user
        }).sort({ createdAt: -1 });
        res.json(history);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
exports.default = router;
