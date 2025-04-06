import express from 'express';
import * as authController from '../controllers/authentication';

const router = express.Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authController.getProfile);

export default router;