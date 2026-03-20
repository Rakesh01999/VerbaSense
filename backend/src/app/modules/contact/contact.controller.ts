import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Message from './message.model';
import ContactVerification from './contact-verification.model';
import { sendContactEmail, sendVerificationCodeEmail } from '../../utils/sendEmail';

// Helper to validate email format
const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// @desc    Send verification code to guest email
export const sendContactVerificationCode = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email || !validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save or update verification record
        await ContactVerification.findOneAndUpdate(
            { email },
            { code, expiresAt },
            { upsert: true, new: true }
        );

        // Send email
        await sendVerificationCodeEmail(email, code);

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email'
        });
    } catch (error: any) {
        console.error('Send verification code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Verify code only (for 3-step flow)
export const verifyContactCode = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email and code are required'
            });
        }

        const verification = await ContactVerification.findOne({ email, code });

        if (!verification || verification.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error: any) {
        console.error('Verify code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Verify code and submit message
export const verifyCodeAndSubmit = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, message, code } = req.body;

        if (!firstName || !lastName || !email || !message || !code) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required, including verification code'
            });
        }

        // Verify code
        const verification = await ContactVerification.findOne({ email, code });

        if (!verification || verification.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
        }

        // Delete verification record
        await ContactVerification.deleteOne({ _id: verification._id });

        // Save message to database
        const newMessage = new Message({
            firstName,
            lastName,
            email,
            message
        });
        await newMessage.save();

        // Send email to admin
        await sendContactEmail({ firstName, lastName, email, message });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });
    } catch (error: any) {
        console.error('Verify and submit error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Submit message for authenticated users (skips verification)
export const submitContactForm = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, message } = req.body;

        // Backend format validation
        if (!email || !validateEmail(email)) {
             return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        if (!firstName || !lastName || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Simple check for authentication token
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required for direct submission. Please use the verification flow for guest messages.'
            });
        }

        try {
            const secret = process.env.JWT_SECRET || 'secret';
            jwt.verify(authHeader.replace('Bearer ', ''), secret);
            // If verification succeeds, proceed
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid session. Please login or use the guest verification flow.'
            });
        }

        // Save to database
        const newMessage = new Message({
            firstName,
            lastName,
            email,
            message
        });
        await newMessage.save();

        // Send email to admin
        await sendContactEmail({ firstName, lastName, email, message });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });
    } catch (error: any) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
