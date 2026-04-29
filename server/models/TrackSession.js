const mongoose = require('mongoose');

const TRACKS = [
  'Laguna Seca',
  'Road Atlanta',
  'Watkins Glen',
  'Circuit of the Americas',
  'Lime Rock Park',
  'Virginia International Raceway',
  'Sonoma Raceway',
  'Sebring International Raceway',
  'Mid-Ohio Sports Car Course',
  'Barber Motorsports Park',
  'Eagles Canyon Raceway',
  'Motorsport Ranch 3.1 Mile',
  'Motorsport Ranch 1.7 Mile',
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
  carLabel: {
    type: String,
    trim: true,
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
  avgLap: {
    type: String,
    trim: true,
  },
  totalLaps: {
    type: Number,
    min: 1,
  },
  laps: {
    type: [String],
    default: [],
  },
  sectors: {
    type: [String],
    default: [],
  },
  duration: {
    type: String,
    trim: true,
  },
  weather: {
    type: String,
    trim: true,
  },
  tireSet: {
    type: String,
    trim: true,
  },
  conditions: {
    type: String,
    enum: { values: ['Dry', 'Wet', 'Damp'], message: 'Conditions must be Dry, Wet, or Damp' },
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

trackSessionSchema.statics.TRACKS = TRACKS;

module.exports = mongoose.model('TrackSession', trackSessionSchema);
