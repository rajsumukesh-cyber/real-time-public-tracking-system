const Trip = require('../models/Trip');

// @desc   Get all trips (admin / analytics)
// @route  GET /api/trips
const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate({ path: 'driver', populate: { path: 'user', select: 'name' } })
      .populate('route', 'routeNumber name')
      .sort({ startTime: -1 })
      .limit(200);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trips', error: error.message });
  }
};

// @desc   Get a single trip
// @route  GET /api/trips/:id
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('driver').populate('route');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trip', error: error.message });
  }
};

module.exports = { getAllTrips, getTripById };
