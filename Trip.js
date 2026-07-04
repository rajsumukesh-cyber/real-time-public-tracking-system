const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'running', 'completed', 'cancelled'],
      default: 'running',
    },
    distanceCoveredKm: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
