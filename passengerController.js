const Passenger = require('../models/Passenger');
const Driver = require('../models/Driver');
const Route = require('../models/Route');

// @desc   Get logged-in passenger's profile
// @route  GET /api/passengers/me
const getMyPassengerProfile = async (req, res) => {
  try {
    const passenger = await Passenger.findOne({ user: req.user._id })
      .populate('user', 'name email phone profilePicture')
      .populate('favoriteRoutes');
    if (!passenger) return res.status(404).json({ message: 'Passenger profile not found' });
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch passenger profile', error: error.message });
  }
};

// @desc   Update passenger profile
// @route  PUT /api/passengers/me
const updateMyPassengerProfile = async (req, res) => {
  try {
    const { address, savedStops } = req.body;
    const passenger = await Passenger.findOneAndUpdate(
      { user: req.user._id },
      { $set: { address, savedStops } },
      { new: true, runValidators: true }
    );
    if (!passenger) return res.status(404).json({ message: 'Passenger profile not found' });
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update passenger profile', error: error.message });
  }
};

// @desc   Add/remove a favorite route
// @route  PATCH /api/passengers/favorites/:routeId
const toggleFavoriteRoute = async (req, res) => {
  try {
    const passenger = await Passenger.findOne({ user: req.user._id });
    if (!passenger) return res.status(404).json({ message: 'Passenger profile not found' });

    const { routeId } = req.params;
    const isFavorite = passenger.favoriteRoutes.some((r) => r.toString() === routeId);

    if (isFavorite) {
      passenger.favoriteRoutes = passenger.favoriteRoutes.filter((r) => r.toString() !== routeId);
    } else {
      passenger.favoriteRoutes.push(routeId);
    }

    await passenger.save();
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update favorites', error: error.message });
  }
};

// @desc   Search buses by bus number, route number, or source/destination text
// @route  GET /api/passengers/search?query=...
const searchBuses = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'query is required' });

    const routes = await Route.find({
      $or: [
        { routeNumber: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { 'stops.name': { $regex: query, $options: 'i' } },
      ],
    });

    const routeIds = routes.map((r) => r._id);

    const drivers = await Driver.find({
      $or: [{ vehicleNumber: { $regex: query, $options: 'i' } }, { route: { $in: routeIds } }],
    })
      .populate('user', 'name')
      .populate('route');

    // Log recent search
    await Passenger.findOneAndUpdate(
      { user: req.user._id },
      { $push: { recentSearches: { $each: [{ query }], $position: 0, $slice: 10 } } }
    );

    res.json({ routes, drivers });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

module.exports = {
  getMyPassengerProfile,
  updateMyPassengerProfile,
  toggleFavoriteRoute,
  searchBuses,
};
