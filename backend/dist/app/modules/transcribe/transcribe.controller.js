"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.uploadAndTranscribe = void 0;
const transcribe_service_1 = require("./transcribe.service");
const transcribe_model_1 = __importDefault(require("./transcribe.model"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
exports.uploadAndTranscribe = (0, catchAsync_1.default)(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an audio file' });
    }
    const audioPath = req.file.path;
    const transcribedText = await (0, transcribe_service_1.transcribeAudio)(audioPath);
    const newTranscription = new transcribe_model_1.default({
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
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Transcription completed successfully',
        data: transcription
    });
});
exports.getHistory = (0, catchAsync_1.default)(async (req, res) => {
    const history = await transcribe_model_1.default.find({
        user: req.user?.id || req.user
    }).sort({ createdAt: -1 });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Transcription history retrieved successfully',
        data: history
    });
});
