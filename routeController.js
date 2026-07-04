const Route = require('../models/Route');

// @desc   Get all active routes
// @route  GET /api/routes
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true }).sort({ routeNumber: 1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch routes', error: error.message });
  }
};

// @desc   Get a single route by id
// @route  GET /api/routes/:id
const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch route', error: error.message });
  }
};

// @desc   Create a route (admin)
// @route  POST /api/routes
const createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create route', error: error.message });
  }
};

// @desc   Update a route (admin)
// @route  PUT /api/routes/:id
const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update route', error: error.message });
  }
};

// @desc   Delete (deactivate) a route (admin)
// @route  DELETE /api/routes/:id
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete route', error: error.message });
  }
};

module.exports = { getAllRoutes, getRouteById, createRoute, updateRoute, deleteRoute };
