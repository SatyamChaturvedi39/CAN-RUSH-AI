const express = require('express');
const router = express.Router();
const {
    getAllPenalties,
    clearPenalty,
    unblockUser,
    getAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Penalty management
router.get('/penalties', getAllPenalties);
router.put('/penalties/:id/clear', clearPenalty);

// User management
router.post('/users/:id/unblock', unblockUser);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;
