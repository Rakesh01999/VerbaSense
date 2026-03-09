import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from './auth.model';
import catchAsync from '../../../shared/catchAsync';
import AppError from '../../errors/AppError';
import sendResponse from '../../utils/sendResponse';
import { sendEmail } from '../../utils/sendEmail';
import { v4 as uuidv4 } from 'uuid';

export const register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        throw new AppError(400, 'User already exists');
    }

    // Generate verification token
    const verificationToken = uuidv4();

    user = new User({
        name,
        email,
        password,
        verificationToken
    });

    await user.save();

    // Send verification email
    const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    await sendEmail(user.email, verificationLink);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: null
    });
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        throw new AppError(400, 'Invalid Credentials');
    }

    if (!user.isVerified) {
        throw new AppError(403, 'Please verify your email address to login.');
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

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        throw new AppError(400, 'Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.send(`
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #28a745;">Email Verified Successfully!</h1>
                <p>Your VerbaSense account is now active.</p>
                <p>You can now close this window and login to the application.</p>
            </body>
        </html>
    `);
});
