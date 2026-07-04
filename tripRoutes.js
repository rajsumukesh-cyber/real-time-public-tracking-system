const express = require('express');
const router = express.Router();
const { getAllTrips, getTripById } = require('../controllers/tripController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllTrips);
router.get('/:id', protect, getTripById);

module.exports = router;
