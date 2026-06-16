const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const SystemLog = require('../models/SystemLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to get IP
const getIp = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';

// Register
router.post('/register', [
  body('name').trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('privacyConsent')
    .custom((value) => value === true || value === 'true')
    .withMessage('You must agree to the privacy policy')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password, privacyConsent } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, privacyConsent });

    // Log registration
    await SystemLog.create({
      action: 'user_registered',
      details: `New user registered: ${name} (${email})`,
      performedBy: user._id,
      performedByName: name,
      performedByEmail: email,
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent']
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Log failed login (unknown user)
      await SystemLog.create({
        action: 'user_login_failed',
        details: `Failed login attempt for unknown email: ${email}`,
        performedByEmail: email,
        ipAddress: getIp(req),
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      await SystemLog.create({
        action: 'user_login_suspended',
        details: `Blocked login attempt by suspended user: ${user.name} (${email})`,
        performedBy: user._id,
        performedByName: user.name,
        performedByEmail: email,
        ipAddress: getIp(req),
        userAgent: req.headers['user-agent']
      });
      return res.status(403).json({ message: 'Your account has been suspended. Please contact the administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await SystemLog.create({
        action: 'user_login_failed',
        details: `Failed login attempt (wrong password) for: ${user.name} (${email})`,
        performedBy: user._id,
        performedByName: user.name,
        performedByEmail: email,
        ipAddress: getIp(req),
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Successful login
    await SystemLog.create({
      action: 'user_login',
      details: `User logged in: ${user.name} (${email}) — Role: ${user.role}`,
      performedBy: user._id,
      performedByName: user.name,
      performedByEmail: email,
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent']
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
