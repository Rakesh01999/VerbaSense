"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const createTransporter = () => nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: process.env.NODE_ENV === 'production',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendEmail = async (to, verificationLink) => {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: '"VerbaSense Support" <noreply@verbasense.com>',
        to,
        subject: 'VerbaSense - Verify your Email',
        text: '',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Welcome to VerbaSense!</h2>
        <p>Thank you for registering. Please confirm your email address to activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify My Email</a>
        </div>
        <p>If the button doesn't work, copy and paste the following link into your browser:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <br />
        <p>Best Regards,<br />The VerbaSense Team</p>
      </div>
    `,
    });
};
exports.sendEmail = sendEmail;
const sendPasswordResetEmail = async (to, resetLink) => {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: '"VerbaSense Support" <noreply@verbasense.com>',
        to,
        subject: 'VerbaSense - Reset Your Password',
        text: `You requested a password reset. Use the link below (valid for 1 hour):\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>We received a request to reset the password for your VerbaSense account.</p>
        <p>Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset My Password</a>
        </div>
        <p>If the button doesn't work, copy and paste the following link into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p style="color: #888; font-size: 13px;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <br />
        <p>Best Regards,<br />The VerbaSense Team</p>
      </div>
    `,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
