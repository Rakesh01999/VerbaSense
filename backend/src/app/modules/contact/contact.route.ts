import express from 'express';
import { submitContactForm, sendContactVerificationCode, verifyCodeAndSubmit, verifyContactCode } from './contact.controller';

const router = express.Router();

// Direct submission for authenticated users
router.post('/', submitContactForm);

// Verification flow for guests
router.post('/send-code', sendContactVerificationCode);
router.post('/verify', verifyContactCode);
router.post('/verify-and-submit', verifyCodeAndSubmit);

export default router;
