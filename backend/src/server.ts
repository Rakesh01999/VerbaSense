import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './app/config/db';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// trust proxy
app.set('trust proxy', true);

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: ['https://verbasense.vercel.app', 'https://verbasense.vercel.app/', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
    res.send('VerbaSense API is running ...');
});

// Error handling Middlewares
app.use(globalErrorHandler);

// Not Found
app.use(notFound);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
