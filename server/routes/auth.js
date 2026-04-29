const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

const User         = require('../models/User');
const Car          = require('../models/Car');
const TrackSession = require('../models/TrackSession');
const requireAuth  = require('../middleware/requireAuth');

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

// PUT /api/auth/profile
router.put(
  '/profile',
  requireAuth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be blank'),
    body('phone').optional().trim(),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError !== null) return;

    try {
      const { name, phone } = req.body;
      if (name !== undefined) req.user.name = name;
      if (phone !== undefined) req.user.phone = phone;
      await req.user.save();
      const { password: _pw, ...safeUser } = req.user.toObject();
      res.json({ user: safeUser });
    } catch (err) {
      console.error('PUT /profile error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// DELETE /api/auth/account
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    await TrackSession.deleteMany({ driver: userId });
    await Car.deleteMany({ owner: userId });
    await User.findByIdAndDelete(userId);
    req.logout((err) => {
      if (err) console.error('Logout error after deletion:', err);
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Account deleted.' });
      });
    });
  } catch (err) {
    console.error('DELETE /account error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
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
