import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import transcribeRoutes from './routes/transcribe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcribe', transcribeRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('VerbaSense API is running...');
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
    console.warn('WARNING: MongoDB URI is not fully configured. Please update .env with your credentials.');
}

mongoose.connect(MONGODB_URI!)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas.');
        if (process.env.NODE_ENV !== 'test') {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        }
    }).catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

export default app;
