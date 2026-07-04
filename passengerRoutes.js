const express = require('express');
const router = express.Router();
const {
  getMyPassengerProfile,
  updateMyPassengerProfile,
  toggleFavoriteRoute,
  searchBuses,
} = require('../controllers/passengerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('passenger'), getMyPassengerProfile);
router.put('/me', protect, authorize('passenger'), updateMyPassengerProfile);
router.patch('/favorites/:routeId', protect, authorize('passenger'), toggleFavoriteRoute);
router.get('/search', protect, authorize('passenger'), searchBuses);

module.exports = router;
