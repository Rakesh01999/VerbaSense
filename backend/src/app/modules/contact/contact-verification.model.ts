import mongoose, { Schema, Document } from 'mongoose';

export interface IContactVerification extends Document {
    email: string;
    code: string;
    expiresAt: Date;
}

const ContactVerificationSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Document will be deleted when expiresAt is reached
    }
});

export default mongoose.model<IContactVerification>('ContactVerification', ContactVerificationSchema);
