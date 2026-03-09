"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.getAllUsers = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_model_1 = __importDefault(require("./auth.model"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const sendEmail_1 = require("../../utils/sendEmail");
const uuid_1 = require("uuid");
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
