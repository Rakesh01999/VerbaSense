import mongoose, { Schema, Document } from 'mongoose';

export interface ITranscription extends Document {
    user: mongoose.Types.ObjectId;
    audioUrl: string;
    transcribedText: string;
    language: string;
    metadata: {
        size?: number;
        format?: string;
        duration?: number;
    };
    createdAt: Date;
}

const TranscriptionSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    audioUrl: {
        type: String,
        required: true
    },
    transcribedText: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'en'
    },
    metadata: {
        size: Number,
        format: String,
        duration: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<ITranscription>('Transcription', TranscriptionSchema);
