const express = require('express');
const { body, param, validationResult } = require('express-validator');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');

const Car = require('../models/Car');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

const CAR_FIELDS = ['make', 'model', 'year', 'color', 'nickname', 'plate', 'odo', 'bestLap', 'bestTrack', 'photo', 'photoPosition', 'photoScale', 'mods'];

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
    body('bestLap')
      .optional()
      .matches(/^\d+:\d{2}\.\d{3}$/)
      .withMessage('bestLap must be in format M:SS.mmm'),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError !== null) return;

    try {
      const data = { owner: req.user._id };
      CAR_FIELDS.forEach((f) => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
      const car = await Car.create(data);
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
    body('bestLap')
      .optional()
      .matches(/^\d+:\d{2}\.\d{3}$/)
      .withMessage('bestLap must be in format M:SS.mmm'),
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
      CAR_FIELDS.forEach((field) => {
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

// POST /api/cars/:id/photo
router.post('/:id/photo', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file provided.' });

  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found.' });
    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const photoUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'sector/cars', public_id: `car-${car._id}`, overwrite: true },
        (err, result) => err ? reject(err) : resolve(result.secure_url)
      );
      stream.end(req.file.buffer);
    });

    car.photo = photoUrl;
    car.photoPosition = '50% 50%';
    car.photoScale = 1;
    await car.save();
    res.json({ car, photoUrl });
  } catch (err) {
    console.error('POST /cars/:id/photo error:', err);
    res.status(500).json({ message: 'Failed to upload photo.' });
  }
});

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
