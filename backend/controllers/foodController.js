const FoodItem = require('../models/FoodItem');

/**
 * @desc    Get all food items (with optional vendor filter)
 * @route   GET /api/foods?vendorId=xxx&available=true
 * @access  Public
 */
exports.getAllFoodItems = async (req, res) => {
    try {
        const { vendorId, available } = req.query;

        // Build query
        const query = {};
        if (vendorId) query.vendorId = vendorId;
        if (available === 'true') query.isAvailable = true;

        const foodItems = await FoodItem.find(query)
            .populate('vendorId', 'name')
            .select('-__v');

        res.status(200).json({
            success: true,
            count: foodItems.length,
            data: foodItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching food items',
            error: error.message
        });
    }
};

/**
 * @desc    Get food items by vendor
 * @route   GET /api/foods/vendor/:vendorId
 * @access  Public
 */
exports.getFoodItemsByVendor = async (req, res) => {
    try {
        const foodItems = await FoodItem.find({ vendorId: req.params.vendorId })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: foodItems.length,
            data: foodItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching food items',
            error: error.message
        });
    }
};

/**
 * @desc    Create new food item
 * @route   POST /api/foods
 * @access  Private (Vendor only)
 */
exports.createFoodItem = async (req, res) => {
    try {
        const { name, description, price, category, preparationTime, vendorId, imageUrl } = req.body;

        // Validation
        if (!name || !price || !preparationTime || !vendorId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, price, preparation time, and vendor ID'
            });
        }

        const foodItem = await FoodItem.create({
            name,
            description,
            price,
            category,
            preparationTime,
            vendorId,
            imageUrl
        });

        res.status(201).json({
            success: true,
            data: foodItem,
            message: 'Food item created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating food item',
            error: error.message
        });
    }
};

/**
 * @desc    Update food item
 * @route   PUT /api/foods/:id
 * @access  Private (Vendor only)
 */
exports.updateFoodItem = async (req, res) => {
    try {
        const foodItem = await FoodItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: foodItem,
            message: 'Food item updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating food item',
            error: error.message
        });
    }
};

/**
 * @desc    Toggle food item availability
 * @route   PUT /api/foods/:id/availability
 * @access  Private (Vendor only)
 */
exports.toggleAvailability = async (req, res) => {
    try {
        const foodItem = await FoodItem.findById(req.params.id);

        if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        foodItem.isAvailable = !foodItem.isAvailable;
        await foodItem.save();

        res.status(200).json({
            success: true,
            data: foodItem,
            message: `Food item is now ${foodItem.isAvailable ? 'available' : 'unavailable'}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling availability',
            error: error.message
        });
    }
};

/**
 * @desc    Delete food item
 * @route   DELETE /api/foods/:id
 * @access  Private (Vendor only)
 */
exports.deleteFoodItem = async (req, res) => {
    try {
        const foodItem = await FoodItem.findByIdAndDelete(req.params.id);

        if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Food item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting food item',
            error: error.message
        });
    }
};
