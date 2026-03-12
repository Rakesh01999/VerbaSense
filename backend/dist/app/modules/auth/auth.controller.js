"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.getAllUsers = exports.login = exports.register = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const auth_model_1 = __importDefault(require("./auth.model"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const sendEmail_1 = require("../../utils/sendEmail");
const uuid_1 = require("uuid");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.register = (0, catchAsync_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    let user = await auth_model_1.default.findOne({ email });
    if (user) {
        throw new AppError_1.default(400, 'User already exists');
    }
    // Generate verification token
    const verificationToken = (0, uuid_1.v4)();
    user = new auth_model_1.default({
        name,
        email,
        password,
        verificationToken
    });
    await user.save();
    // Send verification email
    const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    await (0, sendEmail_1.sendEmail)(user.email, verificationLink);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: null
    });
});
exports.login = (0, catchAsync_1.default)(async (req, res) => {
    const { email, password } = req.body;
    let user = await auth_model_1.default.findOne({ email });
    if (!user) {
        throw new AppError_1.default(400, 'Invalid Credentials');
    }
    if (!user.isVerified) {
        throw new AppError_1.default(403, 'Please verify your email address to login.');
    }
    if (!user.password) {
        throw new AppError_1.default(400, 'This account was created with Google. Please use Google Login.');
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new AppError_1.default(400, 'Invalid Credentials');
    }
    const payload = { user: { id: user.id } };
    const secret = process.env.JWT_SECRET || 'secret';
    jsonwebtoken_1.default.sign(payload, secret, { expiresIn: 3600 }, (err, token) => {
        if (err)
            throw err;
        (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: 'User logged in successfully',
            data: { token }
        });
    });
});
exports.getAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    const users = await auth_model_1.default.find().select('-password');
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: users
    });
});
exports.verifyEmail = (0, catchAsync_1.default)(async (req, res) => {
    const { token } = req.params;
    const user = await auth_model_1.default.findOne({ verificationToken: token });
    if (!user) {
        throw new AppError_1.default(400, 'Invalid or expired verification token');
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
exports.forgotPassword = (0, catchAsync_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new AppError_1.default(400, 'Please provide an email address');
    }
    const user = await auth_model_1.default.findOne({ email });
    // Always respond generically to prevent email enumeration
    if (!user) {
        (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
            data: null
        });
        return;
    }
    // Generate a secure random token
    const rawToken = crypto_1.default.randomBytes(32).toString('hex');
    // Store the hashed version in the DB (never store raw token)
    const hashedToken = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    // Send email with the raw token in the link
    const resetLink = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${rawToken}`;
    await (0, sendEmail_1.sendPasswordResetEmail)(user.email, resetLink);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        data: null
    });
});
// @desc    Reset Password - update password using token from email
exports.resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) {
        throw new AppError_1.default(400, 'Token and new password are required');
    }
    if (password.length < 6) {
        throw new AppError_1.default(400, 'Password must be at least 6 characters long');
    }
    // Hash the incoming raw token to compare with what's in DB
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = await auth_model_1.default.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() } // token must not be expired
    });
    if (!user) {
        throw new AppError_1.default(400, 'Password reset token is invalid or has expired');
    }
    // Update password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
        data: null
    });
});
exports.googleLogin = (0, catchAsync_1.default)(async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        throw new AppError_1.default(400, 'Google credential is required');
    }
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new AppError_1.default(400, 'Invalid Google token');
    }
    const { email, name, sub: googleId } = payload;
    let user = await auth_model_1.default.findOne({ email });
    if (user) {
        // If user exists but doesn't have a googleId, link it
        if (!user.googleId) {
            user.googleId = googleId;
            // Also mark as verified if it was Google login
            user.isVerified = true;
            await user.save();
        }
    }
    else {
        // Create new user
        user = new auth_model_1.default({
            name,
            email,
            googleId,
            isVerified: true, // Google accounts are implicitly verified
        });
        await user.save();
    }
    const jwtPayload = { user: { id: user.id } };
    const secret = process.env.JWT_SECRET || 'secret';
    jsonwebtoken_1.default.sign(jwtPayload, secret, { expiresIn: '1h' }, (err, token) => {
        if (err)
            throw err;
        (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: 'User logged in successfully with Google',
            data: { token }
        });
    });
});
