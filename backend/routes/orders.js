const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getVendorQueue,
    acceptOrder,
    markPreparing,
    markReady,
    completeOrder,
    cancelOrder,
    getOrder
} = require('../controllers/orderController');
const { protect, authorize, checkBlocked } = require('../middleware/auth');

// Student routes
router.post('/', protect, authorize('student'), checkBlocked, createOrder);
router.get('/my-orders', protect, authorize('student'), getMyOrders);
router.put('/:id/complete', protect, authorize('student'), completeOrder);
router.put('/:id/cancel', protect, authorize('student'), cancelOrder);

// Vendor routes
router.get('/vendor/queue', protect, authorize('vendor'), getVendorQueue);
router.put('/:id/accept', protect, authorize('vendor'), acceptOrder);
router.put('/:id/preparing', protect, authorize('vendor'), markPreparing);
router.put('/:id/ready', protect, authorize('vendor'), markReady);

// Shared routes
router.get('/:id', protect, getOrder);

module.exports = router;
