const express = require('express');
const { body, param, validationResult } = require('express-validator');

const Car = require('../models/Car');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// GET /api/cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ cars });
  } catch (err) {
    console.error('GET /cars error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/cars
router.post(
  '/',
  [
    body('make').trim().notEmpty().withMessage('Make is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('year')
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage('Year must be a valid number'),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError !== null) return;

    try {
      const { make, model, year, color, photo, mods } = req.body;
      const car = await Car.create({ owner: req.user._id, make, model, year, color, photo, mods });
      res.status(201).json({ car });
    } catch (err) {
      console.error('POST /cars error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// PUT /api/cars/:id
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid car ID'),
    body('make').optional().trim().notEmpty().withMessage('Make cannot be blank'),
    body('model').optional().trim().notEmpty().withMessage('Model cannot be blank'),
    body('year')
      .optional()
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage('Year must be a valid number'),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError !== null) return;

    try {
      const car = await Car.findById(req.params.id);
      if (!car) return res.status(404).json({ message: 'Car not found.' });
      if (car.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      const allowed = ['make', 'model', 'year', 'color', 'photo', 'mods'];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) car[field] = req.body[field];
      });
      await car.save();
      res.json({ car });
    } catch (err) {
      console.error('PUT /cars/:id error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

// DELETE /api/cars/:id
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid car ID')],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError !== null) return;

    try {
      const car = await Car.findById(req.params.id);
      if (!car) return res.status(404).json({ message: 'Car not found.' });
      if (car.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      await car.deleteOne();
      res.json({ message: 'Car deleted.' });
    } catch (err) {
      console.error('DELETE /cars/:id error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

module.exports = router;
