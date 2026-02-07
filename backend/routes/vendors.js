const express = require('express');
const router = express.Router();
const {
    getAllVendors,
    getVendor,
    updateVendorStatus,
    getVendorStats
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllVendors);
router.get('/:id', getVendor);

// Protected routes (Vendor only)
router.put('/:id/status', protect, authorize('vendor'), updateVendorStatus);
router.get('/:id/stats', protect, authorize('vendor'), getVendorStats);

module.exports = router;
