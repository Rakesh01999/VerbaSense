import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: string;
    file?: Express.Multer.File;
}

export default function (req: AuthRequest, res: Response, next: NextFunction) {
    // Get token from header
    const token = req.header('Authorization');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const secret = process.env.JWT_SECRET || 'secret';
        const decoded = jwt.verify(token.replace('Bearer ', ''), secret) as any;
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}
