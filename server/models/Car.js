const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  },
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1886,
    max: new Date().getFullYear() + 1,
  },
  color: {
    type: String,
    trim: true,
  },
  nickname: {
    type: String,
    trim: true,
  },
  plate: {
    type: String,
    trim: true,
  },
  odo: {
    type: String,
    trim: true,
  },
  bestLap: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => !v || /^\d+:\d{2}\.\d{3}$/.test(v),
      message: 'bestLap must be in format M:SS.mmm',
    },
  },
  bestTrack: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
  },
  photoPosition: {
    type: String,
    default: '50% 50%',
  },
  photoScale: {
    type: Number,
    default: 1,
    min: 1,
    max: 4,
  },
  mods: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Car', carSchema);
