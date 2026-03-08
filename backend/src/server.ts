import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';

// Import routes
import authRoutes from './routes/auth';
import transcribeRoutes from './routes/transcribe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Adjust path for uploads

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcribe', transcribeRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('VerbaSense API is running...');
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
