import express from 'express';
import * as authController from './auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// @route   POST api/auth/register
router.post('/register', authController.register);

// @route   POST api/auth/login
router.post('/login', authController.login);

// @route   POST api/auth/users
router.get('/users', authController.getAllUsers);

// @route   GET api/auth/me
router.get('/me', auth, authController.getMe);

// @route   POST api/auth/google-login
router.post('/google-login', authController.googleLogin);

// @route   GET api/auth/verify-email/:token
router.get('/verify-email/:token', authController.verifyEmail);

// @route   POST api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// @route   POST api/auth/reset-password/:token
router.post('/reset-password/:token', authController.resetPassword);

export default router;
