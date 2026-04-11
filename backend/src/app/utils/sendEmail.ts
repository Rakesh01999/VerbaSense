import AppError from '../errors/AppError';

// Brevo Business logic
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Helper function to send emails using the Brevo HTTP API.
 * Robust method for cloud providers like Render, cause it
 * uses standard HTTPS traffic (Port 443) which is never blocked.
 */
const sendBrevoEmail = async (payload: {
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
    textContent?: string;
}) => {
    // Use BREVO_API_KEY (should start with xkeysib-)
    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY;
    const senderEmail = process.env.EMAIL_USER || 'rbiswas01999@gmail.com';

    if (!apiKey || apiKey.startsWith('xsmtpsib-')) {
        console.error('[EmailService] Initialization Error: Missing or invalid API Key type. Expected HTTP API V3 Key (xkeysib-), but received SMTP Key (xsmtpsib-).');
        throw new AppError(500, 'Email service is temporarily unavailable. Please try again later.');
    }

    try {
        const response = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'VerbaSense', email: senderEmail },
                to: payload.to,
                subject: payload.subject,
                htmlContent: payload.htmlContent,
                textContent: payload.textContent || ''
            })
        });

        const result: any = await response.json();

        if (!response.ok) {
            console.error('Brevo API Error Response:', result);
            throw new AppError(response.status, `Brevo API Error: ${result.message || 'Unknown error'}`);
        }

        console.log('Email sent successfully via Brevo API');
        return result;
    } catch (error: any) {
        console.error('Error in sendBrevoEmail:', error);
        throw new AppError(500, error.message || 'Failed to send email via Brevo API');
    }
};

export const sendEmail = async (to: string, verificationLink: string) => {
    await sendBrevoEmail({
        to: [{ email: to }],
        subject: 'VerbaSense - Verify your Email',
        htmlContent: `
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
        textContent: `Welcome to VerbaSense!\n\nThank you for registering. Please confirm your email address by visiting the following link:\n\n${verificationLink}\n\nBest Regards,\nThe VerbaSense Team`
    });
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
    await sendBrevoEmail({
        to: [{ email: to }],
        subject: 'VerbaSense - Reset Your Password',
        htmlContent: `
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
        textContent: `You requested a password reset. Use the link below (valid for 1 hour):\n\n${resetLink}`
    });
};

export const sendContactEmail = async (data: { firstName: string; lastName: string; email: string; message: string }) => {
    const adminEmail = process.env.EMAIL_USER || 'rbiswas01999@gmail.com';

    await sendBrevoEmail({
        to: [{ email: adminEmail }],
        subject: `New Contact Message from ${data.firstName} ${data.lastName}`,
        htmlContent: `
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
        textContent: `Name: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
    });
};

export const sendVerificationCodeEmail = async (to: string, code: string) => {
    await sendBrevoEmail({
        to: [{ email: to }],
        subject: 'VerbaSense - Your Contact Verification Code',
        htmlContent: `
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
        textContent: `Your verification code is: ${code}. It will expire in 10 minutes.`
    });
};
