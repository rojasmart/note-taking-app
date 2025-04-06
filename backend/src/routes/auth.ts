import express from 'express';
import { login, register, getProfile } from '../controllers/authentication';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

export default router;