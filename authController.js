const User = require('../models/User');
const Driver = require('../models/Driver');
const Passenger = require('../models/Passenger');
const generateToken = require('../utils/generateToken');

// @desc   Register a new user (driver or passenger)
// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, vehicleNumber, vehicleType, licenseNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }

    if (!['driver', 'passenger'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either driver or passenger' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone, role });

    if (role === 'driver') {
      if (!vehicleNumber || !licenseNumber) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Vehicle number and license number are required for drivers' });
      }
      await Driver.create({
        user: user._id,
        vehicleNumber,
        vehicleType: vehicleType || 'Bus',
        licenseNumber,
      });
    } else {
      await Passenger.create({ user: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// @desc   Get current logged in user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @desc   Logout (client discards token; endpoint kept for symmetry / future blacklist)
// @route  POST /api/auth/logout
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, getMe, logout };
