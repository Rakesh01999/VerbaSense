const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { transcribeAudio } = require('../services/whisperService');
const Transcription = require('../models/Transcription');

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
      return cb(new Error('Only .wav and .mp3 files are allowed'), false);
    }
    cb(null, true);
  }
});

// @route   POST api/transcribe
// @desc    Upload audio and transcribe
// @access  Private
router.post('/', [auth, upload.single('audio')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'Please upload an audio file' });
  }

  try {
    const audioPath = req.file.path;
    const transcribedText = await transcribeAudio(audioPath);

    const newTranscription = new Transcription({
      user: req.user.id,
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
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during transcription');
  }
});

// @route   GET api/transcribe/history
// @desc    Get user's transcription history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Transcription.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
