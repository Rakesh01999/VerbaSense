import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from './auth.model';
import Transcription from '../transcribe/transcribe.model';
import catchAsync from '../../../shared/catchAsync';
import AppError from '../../errors/AppError';
import sendResponse from '../../utils/sendResponse';
import { sendEmail, sendPasswordResetEmail } from '../../utils/sendEmail';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';
import { v4 as uuidv4 } from 'uuid';
 
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        throw new AppError(400, 'User already exists');
    }

    // Generate verification token
    const verificationToken = uuidv4();

    let photoUrl = undefined;
    if (req.file) {
        photoUrl = await uploadToCloudinary(req.file.path, 'profiles', 'image');
    }

    user = new User({
        name,
        email,
        password,
        verificationToken,
        photo: photoUrl || undefined
    });

    await user.save();
    console.log(`User created successfully: ${user.email}. Attempting to send verification email...`);
    
    // Send verification email
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const verificationLink = `${backendUrl}/api/auth/verify-email/${verificationToken}`;
    
    try {
        await sendEmail(user.email, verificationLink);
        console.log(`Verification email sent to: ${user.email}`);
    } catch (error) {
        console.error('CRITICAL: Failed to send verification email during registration:', error);
        throw new AppError(500, 'Account created, but we could not send a verification email. Please check your inbox again in a few minutes or try logging in to trigger a resend.');
    }

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

    if (!user.password) {
        throw new AppError(400, 'This account was created with Google. Please use Google Login.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError(400, 'Invalid Credentials');
    }
    const payload = { user: { id: user.id } };
    const secret = process.env.JWT_SECRET || 'secret';

    jwt.sign(payload, secret, { expiresIn: '24h' }, (err, token) => {
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

// @desc    Forgot Password - send reset email
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError(400, 'Please provide an email address');
    }

    const user = await User.findOne({ email });

    // Always respond generically to prevent email enumeration
    if (!user) {
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
            data: null
        });
        return;
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Store the hashed version in the DB (never store raw token)
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // Send email with the raw token in the link — frontend handles the reset form
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        data: null
    });
});

// @desc    Reset Password - update password using token from email
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
        throw new AppError(400, 'Token and new password are required');
    }

    if (password.length < 6) {
        throw new AppError(400, 'Password must be at least 6 characters long');
    }

    // Hash the incoming raw token to compare with what's in DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() } // token must not be expired
    });

    if (!user) {
        throw new AppError(400, 'Password reset token is invalid or has expired');
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
        data: null
    });
});

export const googleLogin = catchAsync(async (req: Request, res: Response) => {
    const { credential } = req.body;

    if (!credential) {
        throw new AppError(400, 'Google credential is required');
    }

    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new AppError(400, 'Invalid Google token');
    }

    const { email, name, sub: googleId, picture: photo } = payload;

    let user = await User.findOne({ email });

    if (user) {
        // If user exists but doesn't have a googleId, link it
        if (!user.googleId) {
            user.googleId = googleId;
            // Also mark as verified if it was Google login
            user.isVerified = true;
        }
        // Always update photo if it's missing
        if (photo && !user.photo) {
            user.photo = photo;
        }
        
        if (user.isModified()) {
            await user.save();
        }
    } else {
        // Create new user
        user = new User({
            name,
            email,
            googleId,
            isVerified: true, // Google accounts are implicitly verified
            photo
        });
        await user.save();
    }

    const jwtPayload = { user: { id: user.id } };
    const secret = process.env.JWT_SECRET || 'secret';

    jwt.sign(jwtPayload, secret, { expiresIn: '24h' }, (err, token) => {
        if (err) throw err;

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'User logged in successfully with Google',
            data: { token }
        });
    });
});

export const getMe = catchAsync(async (req: any, res: Response) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    // Fetch some basic stats
    const transcriptions = await Transcription.find({ user: user._id });
    const totalMinutes = transcriptions.reduce((acc, curr) => acc + (curr.metadata?.duration || 0), 0) / 60;
    
    const stats = {
        totalTranscriptions: transcriptions.length,
        totalMinutes: Math.round(totalMinutes * 10) / 10,
        averageAccuracy: 99.8, // Mock for now or calculate if available
    };

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User profile retrieved successfully',
        data: {
            user,
            stats
        }
    });
});

export const updateMe = catchAsync(async (req: any, res: Response) => {
    const { name } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    if (name) {
        user.name = name;
    }

    if (req.file) {
        // Delete old photo from cloud if it's there
        if (user.photo && user.photo.includes('res.cloudinary.com')) {
            await deleteFromCloudinary(user.photo, 'image');
        }
        
        const newPhotoUrl = await uploadToCloudinary(req.file.path, 'profiles', 'image');
        if (newPhotoUrl) {
            user.photo = newPhotoUrl;
        }
    }

    await user.save();

    const updatedUser = await User.findById(user.id).select('-password');

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
    });
});
