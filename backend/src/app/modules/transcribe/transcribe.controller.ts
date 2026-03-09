import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { transcribeAudio } from './transcribe.service';
import Transcription from './transcribe.model';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../utils/sendResponse';

export const uploadAndTranscribe = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an audio file' });
    }

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

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Transcription completed successfully',
        data: transcription
    });
});

export const getHistory = catchAsync(async (req: AuthRequest, res: Response) => {
    const history = await Transcription.find({
        user: (req.user as any)?.id || req.user
    }).sort({ createdAt: -1 });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Transcription history retrieved successfully',
        data: history
    });
});
