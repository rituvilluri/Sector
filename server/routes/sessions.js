const express = require('express');
const { body, param, validationResult } = require('express-validator');

const TrackSession = require('../models/TrackSession');
const Car = require('../models/Car');
const requireAuth = require('../middleware/requireAuth');

const lapToSeconds = (t) => {
  if (!t) return Infinity;
  const [m, s] = t.split(':');
  return parseInt(m, 10) * 60 + parseFloat(s);
};

const router = express.Router();

router.use(requireAuth);

const handleValidation = (req, res, label = 'sessions validation error') => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn(label, errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

const SESSION_FIELDS = [
  'car', 'carLabel', 'track', 'date', 'bestLap', 'avgLap',
  'totalLaps', 'laps', 'sectors', 'duration', 'weather',
  'tireSet', 'conditions', 'notes',
];

// GET /api/sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await TrackSession.find({ driver: req.user._id })
      .populate('car', 'make model year color nickname')
      .sort({ date: -1 });
    res.json({ sessions });
  } catch (err) {
    console.error('GET /sessions error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/sessions/:id
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid session ID')],
  async (req, res) => {
    const validationError = handleValidation(req, res, 'GET /sessions/:id validation error:');
    if (validationError !== null) return;

    try {
      const session = await TrackSession.findById(req.params.id).populate(
        'car',
        'make model year color nickname'
      );
      if (!session) return res.status(404).json({ message: 'Session not found.' });
      if (session.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      res.json({ session });
    } catch (err) {
      console.error('GET /sessions/:id error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// POST /api/sessions
router.post(
  '/',
  [
    body('car').isMongoId().withMessage('Valid car ID required'),
    body('track')
      .trim()
      .notEmpty()
      .isIn(TrackSession.TRACKS)
      .withMessage('Track must be from the preset list'),
    body('date').isISO8601().withMessage('Valid ISO date required'),
    body('bestLap')
      .matches(/^\d+:\d{2}\.\d{3}$/)
      .withMessage('bestLap must be in format M:SS.mmm (e.g. 1:23.456)'),
    body('totalLaps').optional().isInt({ min: 1 }).withMessage('totalLaps must be a positive integer'),
    body('laps').optional().isArray().withMessage('laps must be an array'),
    body('sectors').optional().isArray().withMessage('sectors must be an array'),
    body('conditions').optional().isIn(['Dry', 'Wet', 'Damp']).withMessage('Conditions must be Dry, Wet, or Damp'),
    body('notes').optional().trim().isLength({ max: 2000 }),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res, 'POST /sessions validation error:');
    if (validationError !== null) return;

    try {
      const data = {};
      SESSION_FIELDS.forEach((f) => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
      data.driver = req.user._id;

      const trackSession = await TrackSession.create(data);
      await trackSession.populate('car', 'make model year color nickname');

      // Update car's bestLap/bestTrack if this session set a new personal best
      if (data.car && data.bestLap) {
        const car = await Car.findById(data.car);
        if (car && lapToSeconds(data.bestLap) < lapToSeconds(car.bestLap)) {
          car.bestLap = data.bestLap;
          car.bestTrack = data.track;
          await car.save();
        }
      }

      res.status(201).json({ session: trackSession });
    } catch (err) {
      console.error('POST /sessions error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// PUT /api/sessions/:id
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid session ID'),
    body('track').optional().isIn(TrackSession.TRACKS).withMessage('Invalid track'),
    body('date').optional().isISO8601().withMessage('Valid ISO date required'),
    body('bestLap').optional().matches(/^\d+:\d{2}\.\d{3}$/).withMessage('bestLap must be in format M:SS.mmm'),
    body('totalLaps').optional().isInt({ min: 1 }),
    body('laps').optional().isArray(),
    body('sectors').optional().isArray(),
    body('conditions').optional().isIn(['Dry', 'Wet', 'Damp']),
    body('notes').optional().trim().isLength({ max: 2000 }),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError !== null) return;

    try {
      const session = await TrackSession.findById(req.params.id);
      if (!session) return res.status(404).json({ message: 'Session not found.' });
      if (session.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      SESSION_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) session[field] = req.body[field];
      });
      await session.save();
      await session.populate('car', 'make model year color nickname');
      res.json({ session });
    } catch (err) {
      console.error('PUT /sessions/:id error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// DELETE /api/sessions/:id
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid session ID')],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError !== null) return;

    try {
      const session = await TrackSession.findById(req.params.id);
      if (!session) return res.status(404).json({ message: 'Session not found.' });
      if (session.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      await session.deleteOne();
      res.json({ message: 'Session deleted.' });
    } catch (err) {
      console.error('DELETE /sessions/:id error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

module.exports = router;
