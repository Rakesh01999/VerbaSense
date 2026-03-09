import express from 'express';
import * as authController from './auth.controller';

const router = express.Router();

// @route   POST api/auth/register
router.post('/register', authController.register);

// @route   POST api/auth/login
router.post('/login', authController.login);

// @route   GET api/auth/users
router.get('/users', authController.getAllUsers);

export default router;
