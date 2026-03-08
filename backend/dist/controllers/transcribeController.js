"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.uploadAndTranscribe = void 0;
const whisperService_1 = require("../services/whisperService");
const Transcription_1 = __importDefault(require("../models/Transcription"));
const uploadAndTranscribe = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an audio file' });
    }
    try {
        const audioPath = req.file.path;
        const transcribedText = await (0, whisperService_1.transcribeAudio)(audioPath);
        const newTranscription = new Transcription_1.default({
            user: req.user?.id || req.user,
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
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during transcription');
    }
};
exports.uploadAndTranscribe = uploadAndTranscribe;
const getHistory = async (req, res) => {
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
};
exports.getHistory = getHistory;
