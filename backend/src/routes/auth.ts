import express from 'express';
import { login, register, getProfile } from '../controllers/authentication';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', getProfile);

export default router;