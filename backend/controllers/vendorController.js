const Vendor = require('../models/Vendor');

/**
 * @desc    Get all vendors
 * @route   GET /api/vendors
 * @access  Public
 */
exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().select('-__v');

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vendors',
            error: error.message
        });
    }
};

/**
 * @desc    Get single vendor by ID
 * @route   GET /api/vendors/:id
 * @access  Public
 */
exports.getVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vendor',
            error: error.message
        });
    }
};

/**
 * @desc    Update vendor status (open/closed)
 * @route   PUT /api/vendors/:id/status
 * @access  Private (Vendor only)
 */
exports.updateVendorStatus = async (req, res) => {
    try {
        const { isOpen } = req.body;

        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Check if user owns this vendor
        if (vendor.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this vendor'
            });
        }

        vendor.isOpen = isOpen;
        await vendor.save();

        res.status(200).json({
            success: true,
            data: vendor,
            message: `Vendor is now ${isOpen ? 'open' : 'closed'}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating vendor status',
            error: error.message
        });
    }
};

/**
 * @desc    Get vendor statistics
 * @route   GET /api/vendors/:id/stats
 * @access  Private (Vendor only)
 */
exports.getVendorStats = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Check if user owns this vendor
        if (vendor.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this vendor stats'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                vendorName: vendor.name,
                isOpen: vendor.isOpen,
                currentLoad: vendor.currentLoad,
                capacity: vendor.capacity,
                averagePreparationTime: vendor.averagePreparationTime,
                utilizationPercentage: ((vendor.currentLoad / vendor.capacity) * 100).toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vendor stats',
            error: error.message
        });
    }
};
