const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    address: { type: String, default: '' },
    favoriteRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
    savedStops: [
      {
        name: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    ],
    recentSearches: [
      {
        query: String,
        searchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Passenger', passengerSchema);
