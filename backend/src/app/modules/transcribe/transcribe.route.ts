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

// @route   PATCH api/transcribe/:id - Update a transcription
router.patch('/:id', auth, transcribeController.updateTranscription);

// @route   DELETE api/transcribe - Clear all history
router.delete('/', auth, transcribeController.clearAllHistory);

// @route   GET api/transcribe/diagnostic - Return system info for debugging Render
router.get('/diagnostic', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        const isWindows = process.platform === 'win32';
        const WHISPER_PATH = process.env.WHISPER_PATH || path.join(process.cwd(), `bin/whisper-cli${isWindows ? '.exe' : ''}`);
        const MODEL_PATH_EN = process.env.MODEL_PATH_EN || path.join(process.cwd(), 'bin/ggml-base.en.bin');
        const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

        const executeCommand = (cmd: string): Promise<string> => {
            return new Promise((resolve) => {
                exec(cmd, (error: any, stdout: any, stderr: any) => {
                    resolve(`STDOUT: ${stdout}\nSTDERR: ${stderr}\nERROR: ${error?.message || 'none'}`);
                });
            });
        };

        const diagnostics = {
            os: `${os.type()} ${os.release()} ${os.arch()}`,
            cwd: process.cwd(),
            whisperPath: WHISPER_PATH,
            whisperExists: fs.existsSync(WHISPER_PATH),
            whisperPerms: fs.existsSync(WHISPER_PATH) ? fs.statSync(WHISPER_PATH).mode.toString(8) : null,
            modelPath: MODEL_PATH_EN,
            modelExists: fs.existsSync(MODEL_PATH_EN),
            uploadsDirExists: fs.existsSync(UPLOADS_DIR),
            ffmpegTest: await executeCommand('ffmpeg -version | head -n 1'),
            whisperTest: fs.existsSync(WHISPER_PATH) ? await executeCommand(`"${WHISPER_PATH}" -h | head -n 5`) : 'Binary not found'
        };

        res.json({ success: true, diagnostics });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
