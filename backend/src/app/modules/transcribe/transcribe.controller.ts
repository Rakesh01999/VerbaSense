import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { transcribeAudio } from './transcribe.service';
import Transcription from './transcribe.model';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';

export const uploadAndTranscribe = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an audio file' });
    }

    const audioPath = req.file.path;
    const language = req.body.language || 'en';
    const { text: transcribedText, duration } = await transcribeAudio(audioPath, language);

    const cloudinaryUrl = await uploadToCloudinary(audioPath, 'audio', 'video');

    const newTranscription = new Transcription({
        user: (req.user as any)?.id || req.user,
        audioUrl: cloudinaryUrl || audioPath,
        transcribedText,
        language,
        metadata: {
            size: req.file.size,
            format: req.file.mimetype,
            duration: duration
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

export const deleteTranscription = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    const transcription = await Transcription.findOneAndDelete({
        _id: id,
        user: (req.user as any)?.id || req.user
    });

    if (!transcription) {
        return res.status(404).json({
            success: false,
            message: 'Transcription not found or unauthorized'
        });
    }

    if (transcription.audioUrl && transcription.audioUrl.includes('res.cloudinary.com')) {
        await deleteFromCloudinary(transcription.audioUrl, 'video');
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Transcription deleted successfully',
        data: transcription
    });
});

export const clearAllHistory = catchAsync(async (req: AuthRequest, res: Response) => {
    const transcriptions = await Transcription.find({
        user: (req.user as any)?.id || req.user
    });

    // Delete associated files from Cloudinary
    for (const t of transcriptions) {
        if (t.audioUrl && t.audioUrl.includes('res.cloudinary.com')) {
            await deleteFromCloudinary(t.audioUrl, 'video');
        }
    }

    const result = await Transcription.deleteMany({
        user: (req.user as any)?.id || req.user
    });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Deleted ${result.deletedCount} transcriptions`,
        data: result
    });
});

export const updateTranscription = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { transcribedText } = req.body;
    
    const transcription = await Transcription.findOneAndUpdate(
        { _id: id, user: (req.user as any)?.id || req.user },
        { transcribedText },
        { new: true }
    );

    if (!transcription) {
        return res.status(404).json({
            success: false,
            message: 'Transcription not found or unauthorized'
        });
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Transcription updated successfully',
        data: transcription
    });
});
