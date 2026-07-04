const express = require('express');
const router = express.Router();
const {
  getMyDriverProfile,
  updateMyDriverProfile,
  setOnlineStatus,
  startTrip,
  endTrip,
  getTodaysTrips,
  getLiveDrivers,
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

// Public-ish (any authenticated role) — used by passenger map
router.get('/live', protect, getLiveDrivers);

// Driver-only routes
router.get('/me', protect, authorize('driver'), getMyDriverProfile);
router.put('/me', protect, authorize('driver'), updateMyDriverProfile);
router.patch('/status', protect, authorize('driver'), setOnlineStatus);
router.post('/trips/start', protect, authorize('driver'), startTrip);
router.post('/trips/:tripId/end', protect, authorize('driver'), endTrip);
router.get('/trips/today', protect, authorize('driver'), getTodaysTrips);

module.exports = router;
