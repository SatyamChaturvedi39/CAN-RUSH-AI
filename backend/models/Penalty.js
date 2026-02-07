const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    penaltyType: {
        type: String,
        enum: ['warning', 'points', 'block'],
        required: true
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    reason: {
        type: String,
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    isCleared: {
        type: Boolean,
        default: false
    },
    clearedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin/Faculty who cleared it
    },
    clearedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster student penalty lookups
penaltySchema.index({ studentId: 1, isCleared: 1 });

module.exports = mongoose.model('Penalty', penaltySchema);
