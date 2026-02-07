const User = require('../models/User');
const Penalty = require('../models/Penalty');

/**
 * @desc    Get all penalties (Admin)
 * @route   GET /api/admin/penalties
 * @access  Private (Admin)
 */
exports.getAllPenalties = async (req, res) => {
    try {
        const penalties = await Penalty.find()
            .populate('studentId', 'name email studentId')
            .populate('orderId', 'orderToken')
            .sort({ issuedAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: penalties.length,
            data: penalties
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching penalties',
            error: error.message
        });
    }
};

/**
 * @desc    Clear penalty (Faculty/Admin)
 * @route   PUT /api/admin/penalties/:id/clear
 * @access  Private (Admin)
 */
exports.clearPenalty = async (req, res) => {
    try {
        const penalty = await Penalty.findById(req.params.id);

        if (!penalty) {
            return res.status(404).json({
                success: false,
                message: 'Penalty not found'
            });
        }

        if (penalty.isCleared) {
            return res.status(400).json({
                success: false,
                message: 'Penalty already cleared'
            });
        }

        penalty.isCleared = true;
        penalty.clearedBy = req.user.id;
        penalty.clearedAt = new Date();
        await penalty.save();

        res.status(200).json({
            success: true,
            data: penalty,
            message: 'Penalty cleared successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing penalty',
            error: error.message
        });
    }
};

/**
 * @desc    Unblock student (Admin)
 * @route   POST /api/admin/users/:id/unblock
 * @access  Private (Admin)
 */
exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isBlocked) {
            return res.status(400).json({
                success: false,
                message: 'User is not blocked'
            });
        }

        user.isBlocked = false;
        // Optionally reset penalty points
        if (req.body.resetPoints) {
            user.penaltyPoints = 0;
            user.warnings = 0;
        }
        await user.save();

        res.status(200).json({
            success: true,
            data: user,
            message: 'User unblocked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error unblocking user',
            error: error.message
        });
    }
};

/**
 * @desc    Get system analytics (Admin)
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
exports.getAnalytics = async (req, res) => {
    try {
        const Order = require('../models/Order');
        const Vendor = require('../models/Vendor');

        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        const activeOrders = await Order.countDocuments({
            status: { $in: ['placed', 'accepted', 'preparing', 'ready'] }
        });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        const lateOrders = await Order.countDocuments({ isLate: true });
        const totalPenalties = await Penalty.countDocuments();
        const blockedUsers = await User.countDocuments({ isBlocked: true });

        const vendors = await Vendor.find().select('name currentLoad capacity');

        res.status(200).json({
            success: true,
            data: {
                orders: {
                    total: totalOrders,
                    completed: completedOrders,
                    active: activeOrders,
                    cancelled: cancelledOrders,
                    late: lateOrders,
                    onTimeRate: totalOrders > 0 ? ((totalOrders - lateOrders) / totalOrders * 100).toFixed(2) : 0
                },
                penalties: {
                    total: totalPenalties,
                    blockedUsers
                },
                vendors: vendors.map(v => ({
                    name: v.name,
                    currentLoad: v.currentLoad,
                    capacity: v.capacity,
                    utilization: ((v.currentLoad / v.capacity) * 100).toFixed(2)
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

module.exports = {
    getAllPenalties,
    clearPenalty,
    unblockUser,
    getAnalytics
};
