const mongoose = require('mongoose');

const TRACKS = [
  'Laguna Seca',
  'Road Atlanta',
  'Watkins Glen',
  'Circuit of the Americas',
  'Lime Rock Park',
  'VIRginia International Raceway',
  'Sonoma Raceway',
  'Sebring International Raceway',
  'Mid-Ohio Sports Car Course',
  'Barber Motorsports Park',
];

const trackSessionSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver is required'],
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required'],
  },
  track: {
    type: String,
    required: [true, 'Track is required'],
    enum: {
      values: TRACKS,
      message: '{VALUE} is not a supported track',
    },
  },
  date: {
    type: Date,
    required: [true, 'Session date is required'],
  },
  bestLap: {
    type: String,
    required: [true, 'Best lap time is required'],
    validate: {
      validator: (v) => /^\d+:\d{2}\.\d{3}$/.test(v),
      message: 'bestLap must be in format M:SS.mmm (e.g. 1:23.456)',
    },
  },
  totalLaps: {
    type: Number,
    min: 1,
  },
  conditions: {
    type: String,
    enum: ['Dry', 'Wet', 'Damp'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Single source of truth — routes import this for express-validator isIn() checks
trackSessionSchema.statics.TRACKS = TRACKS;

module.exports = mongoose.model('TrackSession', trackSessionSchema);
