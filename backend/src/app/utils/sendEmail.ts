import nodemailer from 'nodemailer';
import AppError from '../errors/AppError';

const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('CRITICAL: EMAIL_USER or EMAIL_PASS environment variables are missing.');
        throw new AppError(500, 'Email service is not configured on the server. Please add EMAIL_USER and EMAIL_PASS to your environment variables.');
    }

    // Gmail App Passwords should be 16 characters with no spaces
    const sanitizedPass = process.env.EMAIL_PASS.replace(/\s/g, '');

    console.log(`Initializing SMTP transporter for: ${process.env.EMAIL_USER}`);

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: sanitizedPass,
        },
        connectionTimeout: 60000, // 60s
        greetingTimeout: 60000,   // 60s
        logger: true, // Enable diagnostic logging
        debug: true,  // Enable SMTP debug logging
    });
};

export const sendEmail = async (to: string, verificationLink: string) => {
    try {
        const transporter = createTransporter();
        const fromEmail = process.env.EMAIL_USER || 'noreply@verbasense.com';

        await transporter.sendMail({
            from: `"VerbaSense Support" <${fromEmail}>`,
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
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error; // Rethrow to let the controller handle it
    }
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
    try {
        const transporter = createTransporter();
        const fromEmail = process.env.EMAIL_USER || 'noreply@verbasense.com';

        await transporter.sendMail({
            from: `"VerbaSense Support" <${fromEmail}>`,
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
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

export const sendContactEmail = async (data: { firstName: string; lastName: string; email: string; message: string }) => {
    try {
        const transporter = createTransporter();
        const fromEmail = process.env.EMAIL_USER || 'noreply@verbasense.com';

        await transporter.sendMail({
            from: `"VerbaSense Contact" <${fromEmail}>`,
            to: fromEmail,
            subject: `New Contact Message from ${data.firstName} ${data.lastName}`,
            text: `Name: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
            html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">New Contact Message</h2>
        <p><strong>From:</strong> ${data.firstName} ${data.lastName} (${data.email})</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
        <br />
        <p>Best Regards,<br />The VerbaSense System</p>
      </div>
    `,
        });
    } catch (error) {
        console.error('Error sending contact email:', error);
        throw error;
    }
};

export const sendVerificationCodeEmail = async (to: string, code: string) => {
    try {
        const transporter = createTransporter();
        const fromEmail = process.env.EMAIL_USER || 'noreply@verbasense.com';

        await transporter.sendMail({
            from: `"VerbaSense Support" <${fromEmail}>`,
            to,
            subject: 'VerbaSense - Your Contact Verification Code',
            text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
            html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>You requested to send a message to VerbaSense. Please use the following code to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; border: 2px dashed #007bff; padding: 10px 20px; border-radius: 5px;">${code}</span>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br />
        <p>Best Regards,<br />The VerbaSense Team</p>
      </div>
    `,
        });
    } catch (error) {
        console.error('Error sending verification code email:', error);
        throw error;
    }
};



