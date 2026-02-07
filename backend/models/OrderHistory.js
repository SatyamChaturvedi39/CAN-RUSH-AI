const mongoose = require('mongoose');

const orderHistorySchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    dayOfWeek: {
        type: Number, // 0-6 (Sunday-Saturday)
        required: true,
        min: 0,
        max: 6
    },
    hour: {
        type: Number, // 0-23
        required: true,
        min: 0,
        max: 23
    },
    orderCount: {
        type: Number,
        default: 0,
        min: 0
    },
    averageWaitTime: {
        type: Number, // in minutes
        default: 0,
        min: 0
    },
    peakLoad: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Compound index for ML training queries
orderHistorySchema.index({ vendorId: 1, dayOfWeek: 1, hour: 1 });

module.exports = mongoose.model('OrderHistory', orderHistorySchema);
