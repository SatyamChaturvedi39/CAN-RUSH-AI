const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    vendorId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Vendor name is required'],
        enum: ['Christ Bakery', 'Freshataria', 'Mingos'],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    currentLoad: {
        type: Number,
        default: 0,
        min: 0
    },
    averagePreparationTime: {
        type: Number, // in minutes
        default: 10,
        min: 1
    },
    capacity: {
        type: Number, // max concurrent orders
        default: 10,
        min: 1
    }
}, {
    timestamps: true
});

// Method to check if vendor can accept more orders
vendorSchema.methods.canAcceptOrder = function () {
    return this.isOpen && this.currentLoad < this.capacity;
};

// Method to increment load
vendorSchema.methods.incrementLoad = async function () {
    this.currentLoad += 1;
    await this.save();
};

// Method to decrement load
vendorSchema.methods.decrementLoad = async function () {
    if (this.currentLoad > 0) {
        this.currentLoad -= 1;
        await this.save();
    }
};

// Method to update load (used by order controller)
vendorSchema.methods.updateLoad = async function (change) {
    this.currentLoad += change;
    if (this.currentLoad < 0) this.currentLoad = 0;
    await this.save();
};

module.exports = mongoose.model('Vendor', vendorSchema);
