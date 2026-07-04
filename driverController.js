const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Route = require('../models/Route');

// @desc   Get logged-in driver's profile (+ populated route + user)
// @route  GET /api/drivers/me
const getMyDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id })
      .populate('user', 'name email phone profilePicture')
      .populate('route');
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch driver profile', error: error.message });
  }
};

// @desc   Update driver profile fields
// @route  PUT /api/drivers/me
const updateMyDriverProfile = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType, licenseNumber, route } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { user: req.user._id },
      { $set: { vehicleNumber, vehicleType, licenseNumber, route } },
      { new: true, runValidators: true }
    ).populate('route');
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update driver profile', error: error.message });
  }
};

// @desc   Toggle online/offline status
// @route  PATCH /api/drivers/status
const setOnlineStatus = async (req, res) => {
  try {
    const { online } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { user: req.user._id },
      { onlineStatus: !!online, currentTripStatus: online ? 'idle' : 'offline' },
      { new: true }
    );
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

    const io = req.app.get('io');
    io.emit('driverStatusChanged', { driverId: driver._id, onlineStatus: driver.onlineStatus });

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

// @desc   Start a trip on the driver's assigned route
// @route  POST /api/drivers/trips/start
const startTrip = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
    if (!driver.route) return res.status(400).json({ message: 'No route assigned to this driver' });

    const trip = await Trip.create({ driver: driver._id, route: driver.route, status: 'running' });
    driver.currentTripStatus = 'running';
    await driver.save();

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to start trip', error: error.message });
  }
};

// @desc   End the driver's active trip
// @route  POST /api/drivers/trips/:tripId/end
const endTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      { status: 'completed', endTime: new Date() },
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    await Driver.findByIdAndUpdate(trip.driver, { currentTripStatus: 'idle' });

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to end trip', error: error.message });
  }
};

// @desc   Get today's trips for the logged-in driver
// @route  GET /api/drivers/trips/today
const getTodaysTrips = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const trips = await Trip.find({ driver: driver._id, startTime: { $gte: startOfDay } }).populate('route');
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trips', error: error.message });
  }
};

// @desc   Get all drivers currently online (for passenger map)
// @route  GET /api/drivers/live
const getLiveDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ onlineStatus: true })
      .populate('user', 'name')
      .populate('route', 'routeNumber name stops');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch live drivers', error: error.message });
  }
};

module.exports = {
  getMyDriverProfile,
  updateMyDriverProfile,
  setOnlineStatus,
  startTrip,
  endTrip,
  getTodaysTrips,
  getLiveDrivers,
};
