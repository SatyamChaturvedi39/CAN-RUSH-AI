const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Food item name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    category: {
        type: String,
        enum: ['snacks', 'meals', 'beverages', 'desserts'],
        default: 'snacks'
    },
    preparationTime: {
        type: Number, // in minutes
        required: [true, 'Preparation time is required'],
        min: 1,
        max: 60
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster queries
foodItemSchema.index({ vendorId: 1, isAvailable: 1 });

module.exports = mongoose.model('FoodItem', foodItemSchema);
