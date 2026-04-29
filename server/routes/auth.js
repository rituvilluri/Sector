const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
const SALT_ROUNDS = 12;

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError !== null) return;

    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'An account with that email already exists.' });
      }
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await User.create({ name, email, password: hashed });
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: 'Session error after signup.' });
        const { password: _pw, ...safeUser } = user.toObject();
        return res.status(201).json({ user: safeUser });
      });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Server error during signup.' });
    }
  }
);

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials.' });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      const { password: _pw, ...safeUser } = user.toObject();
      return res.json({ user: safeUser });
    });
  })(req, res, next);
});

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out.' });
    });
  });
});

// GET /api/auth/me  (protected)
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth`,
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  }
);

module.exports = router;
