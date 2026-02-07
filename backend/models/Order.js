const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderToken: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [{
        foodItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FoodItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    requestedPickupTime: {
        type: Date,
        required: true
    },
    predictedReadyTime: {
        type: Date,
        required: true
    },
    actualReadyTime: {
        type: Date
    },
    pickupTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'placed'
    },
    queuePosition: {
        type: Number,
        min: 1
    },
    isLate: {
        type: Boolean,
        default: false
    },
    lateByMinutes: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Generate unique order token (6 characters alphanumeric)
orderSchema.statics.generateToken = function () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

// Calculate if order is late
orderSchema.methods.calculateLateness = function () {
    if (this.pickupTime && this.actualReadyTime) {
        const lateMs = this.pickupTime - this.actualReadyTime;
        const lateMinutes = Math.floor(lateMs / (1000 * 60));

        if (lateMinutes > 5) {
            this.isLate = true;
            this.lateByMinutes = lateMinutes;
        }

        return lateMinutes; // Return for use in controller
    }
    return 0;
};

// Indexes for performance
orderSchema.index({ studentId: 1, status: 1 });
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
