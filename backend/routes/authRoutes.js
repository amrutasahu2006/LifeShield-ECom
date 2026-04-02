const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, googleLogin, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/authSecurityMiddleware');

const loginThrottle = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again in 15 minutes.'
});

const registerThrottle = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many registration attempts. Please try again later.'
});

router.post('/register', registerThrottle, [
  body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name is required'),
  body('email').isString().trim().toLowerCase().isEmail().withMessage('Valid email required'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', loginThrottle, [
  body('email').isString().trim().toLowerCase().isEmail().withMessage('Valid email required'),
  body('password').isString().notEmpty().withMessage('Password is required')
], login);

router.post('/google', googleLogin);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, [
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('password').optional().isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], updateProfile);

module.exports = router;
