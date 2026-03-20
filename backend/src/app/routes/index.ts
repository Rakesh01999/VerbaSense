import express from 'express';
import authRoutes from '../modules/auth/auth.route';
import transcribeRoutes from '../modules/transcribe/transcribe.route';
import contactRoutes from '../modules/contact/contact.route';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: authRoutes
    },
    {
        path: '/transcribe',
        route: transcribeRoutes
    },
    {
        path: '/contact',
        route: contactRoutes
    }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
