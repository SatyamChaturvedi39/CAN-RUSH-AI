const express = require('express');
const router = express.Router();
const {
    getAllFoodItems,
    getFoodItemsByVendor,
    createFoodItem,
    updateFoodItem,
    toggleAvailability,
    deleteFoodItem
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllFoodItems);
router.get('/vendor/:vendorId', getFoodItemsByVendor);

// Protected routes (Vendor only)
router.post('/', protect, authorize('vendor'), createFoodItem);
router.put('/:id', protect, authorize('vendor'), updateFoodItem);
router.put('/:id/availability', protect, authorize('vendor'), toggleAvailability);
router.delete('/:id', protect, authorize('vendor'), deleteFoodItem);

module.exports = router;
