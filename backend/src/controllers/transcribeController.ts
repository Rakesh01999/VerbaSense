import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { transcribeAudio } from '../services/whisperService';
import Transcription from '../models/Transcription';

export const uploadAndTranscribe = async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an audio file' });
    }

    try {
        const audioPath = req.file.path;
        const transcribedText = await transcribeAudio(audioPath);

        const newTranscription = new Transcription({
            user: (req.user as any)?.id || req.user,
            audioUrl: audioPath,
            transcribedText,
            language: 'en',
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
};

export const getHistory = async (req: AuthRequest, res: Response) => {
    try {
        const history = await Transcription.find({
            user: (req.user as any)?.id || req.user
        }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
