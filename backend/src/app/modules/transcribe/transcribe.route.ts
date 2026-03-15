import express from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../middlewares/upload';
import * as transcribeController from './transcribe.controller';

const router = express.Router();

// @route   POST api/transcribe - Upload audio and transcribe
router.post('/', [auth, upload.single('audio')], transcribeController.uploadAndTranscribe);

// @route   GET api/transcribe/history - Get user's transcription history
router.get('/history', auth, transcribeController.getHistory);

// @route   DELETE api/transcribe/:id - Delete a transcription
router.delete('/:id', auth, transcribeController.deleteTranscription);

// @route   DELETE api/transcribe - Clear all history
router.delete('/', auth, transcribeController.clearAllHistory);

export default router;
