const Order = require('../models/Order');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const FoodItem = require('../models/FoodItem');
const Penalty = require('../models/Penalty');
const OrderHistory = require('../models/OrderHistory');
const axios = require('axios');
const { emitNewOrder, emitOrderUpdate, emitOrderReady, emitPenalty } = require('../services/socketService');

/**
 * @desc    Create new order with AI prediction
 * @route   POST /api/orders
 * @access  Private (Student)
 */
const createOrder = async (req, res) => {
    try {
        const { vendorId, items, requestedPickupTime } = req.body;

        // Validation
        if (!vendorId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide vendor and items'
            });
        }

        // Check if user is blocked
        const student = await User.findById(req.user.id);
        if (student.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account is blocked. Contact HOD/Faculty for approval.'
            });
        }

        // Validate vendor
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        if (!vendor.isOpen) {
            return res.status(400).json({
                success: false,
                message: 'Vendor is currently closed'
            });
        }

        // Calculate total and validate items
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const foodItem = await FoodItem.findById(item.foodItemId);

            if (!foodItem) {
                return res.status(404).json({
                    success: false,
                    message: `Food item ${item.foodItemId} not found`
                });
            }

            if (!foodItem.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `${foodItem.name} is currently unavailable`
                });
            }

            orderItems.push({
                foodItemId: foodItem._id,
                quantity: item.quantity,
                price: foodItem.price,
                name: foodItem.name,
                preparationTime: foodItem.preparationTime
            });

            totalAmount += foodItem.price * item.quantity;
        }

        // Get current queue position
        const currentQueue = await Order.countDocuments({
            vendorId,
            status: { $in: ['placed', 'accepted', 'preparing'] }
        });

        // Call ML Service for prediction
        let predictedReadyTime;
        let estimatedWaitMinutes;

        try {
            const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
            const predictionResponse = await axios.post(`${mlServiceUrl}/predict`, {
                vendor_id: vendorId,
                order_items: orderItems.map(item => ({
                    food_item_id: item.foodItemId.toString(),
                    quantity: item.quantity,
                    base_prep_time: item.preparationTime
                })),
                requested_pickup_time: requestedPickupTime,
                current_time: new Date(),
                current_queue_length: currentQueue
            }, {
                timeout: 5000
            });

            predictedReadyTime = new Date(predictionResponse.data.predicted_ready_time);
            estimatedWaitMinutes = predictionResponse.data.estimated_wait_minutes;
        } catch (mlError) {
            // Fallback to simple calculation if ML service is down
            console.error('ML Service error, using fallback:', mlError.message);
            const basePrep = orderItems.reduce((sum, item) => sum + (item.preparationTime * item.quantity), 0);
            const loadFactor = 1 + (currentQueue * 0.2);
            estimatedWaitMinutes = Math.ceil(basePrep * loadFactor);
            predictedReadyTime = new Date(Date.now() + estimatedWaitMinutes * 60000);
        }

        // Generate unique order token
        const orderToken = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create order
        const order = await Order.create({
            orderToken,
            studentId: req.user.id,
            vendorId,
            items: orderItems,
            totalAmount,
            requestedPickupTime: requestedPickupTime || new Date(Date.now() + 30 * 60000),
            predictedReadyTime,
            status: 'placed',
            queuePosition: currentQueue + 1
        });

        // Update vendor load
        await vendor.updateLoad(1);

        // Populate response
        const populatedOrder = await Order.findById(order._id)
            .populate('studentId', 'name email studentId')
            .populate('vendorId', 'name vendorId');

        // Emit real-time notification to vendor
        emitNewOrder(vendorId, {
            orderId: order._id,
            orderToken: order.orderToken,
            studentName: populatedOrder.studentId.name,
            items: orderItems,
            totalAmount,
            queuePosition: order.queuePosition
        });

        res.status(201).json({
            success: true,
            data: populatedOrder,
            message: 'Order placed successfully',
            estimatedWaitMinutes
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

/**
 * @desc    Get student's orders
 * @route   GET /api/orders/my-orders
 * @access  Private (Student)
 */
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ studentId: req.user.id })
            .populate('vendorId', 'name vendorId')
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

/**
 * @desc    Get vendor's order queue
 * @route   GET /api/orders/vendor/queue
 * @access  Private (Vendor)
 */
const getVendorQueue = async (req, res) => {
    try {
        // Find vendor associated with this user
        const vendor = await Vendor.findOne({ userId: req.user.id });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found for this user'
            });
        }

        const orders = await Order.find({
            vendorId: vendor._id,
            status: { $in: ['placed', 'accepted', 'preparing', 'ready'] }
        })
            .populate('studentId', 'name email studentId')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vendor queue',
            error: error.message
        });
    }
};

/**
 * @desc    Accept order (Vendor)
 * @route   PUT /api/orders/:id/accept
 * @access  Private (Vendor)
 */
const acceptOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status !== 'placed') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be accepted in current status'
            });
        }

        order.status = 'accepted';
        await order.save();

        // Emit real-time update to student
        emitOrderUpdate(order.studentId, order._id, {
            status: 'accepted',
            message: 'Your order has been accepted by the vendor'
        });

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order accepted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error accepting order',
            error: error.message
        });
    }
};

/**
 * @desc    Mark order as preparing (Vendor)
 * @route   PUT /api/orders/:id/preparing
 * @access  Private (Vendor)
 */
const markPreparing = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = 'preparing';
        await order.save();

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order marked as preparing'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order',
            error: error.message
        });
    }
};

/**
 * @desc    Mark order ready (Vendor)
 * @route   PUT /api/orders/:id/ready
 * @access  Private (Vendor)
 */
const markReady = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = 'ready';
        order.actualReadyTime = new Date();
        await order.save();

        // Emit real-time notification to student
        emitOrderReady(order.studentId, {
            orderId: order._id,
            orderToken: order.orderToken,
            message: 'Your order is ready for pickup!'
        });

        // Record in order history for ML training
        const hour = new Date().getHours();
        const dayOfWeek = new Date().getDay();

        await OrderHistory.create({
            vendorId: order.vendorId,
            timestamp: new Date(),
            dayOfWeek,
            hour,
            orderCount: 1,
            averageWaitTime: (order.actualReadyTime - order.createdAt) / 60000, // minutes
            peakLoad: await Order.countDocuments({
                vendorId: order.vendorId,
                status: { $in: ['preparing', 'ready'] }
            })
        });

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order ready for pickup'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking order ready',
            error: error.message
        });
    }
};

/**
 * @desc    Complete order (Student picks up)
 * @route   PUT /api/orders/:id/complete
 * @access  Private (Student/Vendor)
 */
const completeOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = 'completed';
        order.pickupTime = new Date();

        // Calculate if late and process penalty
        const lateMinutes = order.calculateLateness();

        if (lateMinutes > 5) {
            order.isLate = true;
            order.lateByMinutes = lateMinutes;

            // Process penalty
            await processPenalty(order._id, order.studentId);
        }

        await order.save();

        // Update vendor load
        const vendor = await Vendor.findById(order.vendorId);
        await vendor.updateLoad(-1);

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order completed',
            isLate: order.isLate,
            lateByMinutes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error completing order',
            error: error.message
        });
    }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (Student/Vendor)
 */
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed order'
            });
        }

        order.status = 'cancelled';
        await order.save();

        // Update vendor load
        const vendor = await Vendor.findById(order.vendorId);
        await vendor.updateLoad(-1);

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: error.message
        });
    }
};

/**
 * @desc    Get single order details
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('studentId', 'name email studentId')
            .populate('vendorId', 'name vendorId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Helper function for penalty processing
async function processPenalty(orderId, studentId) {
    try {
        const student = await User.findById(studentId);
        const order = await Order.findById(orderId);

        let penalty;

        if (student.warnings === 0) {
            // First offense: Warning only
            penalty = {
                type: 'warning',
                points: 0,
                reason: 'First late pickup - Warning issued'
            };
            student.warnings += 1;
        } else if (student.warnings === 1) {
            // Second offense: 5 points
            penalty = {
                type: 'points',
                points: 5,
                reason: 'Second late pickup - 5 penalty points'
            };
            student.warnings += 1;
            student.penaltyPoints += 5;
        } else {
            // Third+ offense: 10 points
            penalty = {
                type: 'points',
                points: 10,
                reason: `${student.warnings + 1} late pickups - 10 penalty points`
            };
            student.warnings += 1;
            student.penaltyPoints += 10;
        }

        // Check if blocked
        if (student.penaltyPoints >= 50) {
            student.isBlocked = true;
            penalty.type = 'block';
            penalty.reason += ' - Account blocked (50+ points)';
        }

        await Penalty.create({
            studentId,
            orderId,
            penaltyType: penalty.type,
            points: penalty.points,
            reason: penalty.reason
        });

        await student.save();

        return penalty; // Return penalty details for socket emission
    } catch (error) {
        console.error('Penalty processing error:', error);
        return null;
    }
}

module.exports = {
    createOrder,
    getMyOrders,
    getVendorQueue,
    acceptOrder,
    markPreparing,
    markReady,
    completeOrder,
    cancelOrder,
    getOrder
};
