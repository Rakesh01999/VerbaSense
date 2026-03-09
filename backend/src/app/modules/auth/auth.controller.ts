import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from './auth.model';
import catchAsync from '../../../shared/catchAsync';
import AppError from '../../errors/AppError';
import sendResponse from '../../utils/sendResponse';

export const register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        throw new AppError(400, 'User already exists');
    }
    user = new User({ name, email, password });
    await user.save();

    const payload = { user: { id: user.id } };
    const secret = process.env.JWT_SECRET || 'secret';

    jwt.sign(payload, secret, { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'User registered successfully',
            data: { token }
        });
    });
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        throw new AppError(400, 'Invalid Credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError(400, 'Invalid Credentials');
    }
    const payload = { user: { id: user.id } };
    const secret = process.env.JWT_SECRET || 'secret';

    jwt.sign(payload, secret, { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'User logged in successfully',
            data: { token }
        });
    });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await User.find().select('-password');

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: users
    });
});

