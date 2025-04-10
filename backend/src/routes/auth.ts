import express from 'express';
import { login, register, getProfile } from '../controllers/authentication';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, ValidationChain } from 'express-validator';

const router = express.Router();

// Auth routes with validation
const registerValidation: ValidationChain[] = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

const loginValidation: ValidationChain[] = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', registerValidation, register);

router.post('/login', loginValidation, login);

router.get('/profile', authMiddleware, getProfile);

export default router;