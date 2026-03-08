import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
        console.warn('WARNING: MongoDB URI is not fully configured. Please update .env with your credentials.');
    }

    try {
        await mongoose.connect(MONGODB_URI!);
        console.log('Successfully connected to MongoDB Atlas.');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

export default connectDB;
