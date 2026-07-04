const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleNumber: { type: String, required: true, unique: true, trim: true },
    vehicleType: { type: String, enum: ['Bus', 'Minibus', 'Shuttle', 'Van'], default: 'Bus' },
    licenseNumber: { type: String, required: true, trim: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    onlineStatus: { type: Boolean, default: false },
    currentTripStatus: {
      type: String,
      enum: ['idle', 'running', 'delayed', 'offline'],
      default: 'offline',
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    speed: { type: Number, default: 0 }, // km/h
    heading: { type: Number, default: 0 },
    lastLocationUpdate: { type: Date },
  },
  { timestamps: true }
);

driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
