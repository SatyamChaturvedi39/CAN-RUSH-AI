const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    studentId: {
        type: String,
        unique: true,
        sparse: true, // Allows null for non-student users
        trim: true
    },
    vendorId: {
        type: String,
        sparse: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Don't return password by default
    },
    role: {
        type: String,
        enum: ['student', 'vendor', 'admin'],
        default: 'student'
    },
    penaltyPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    warnings: {
        type: Number,
        default: 0,
        min: 0
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user can place orders
userSchema.methods.canPlaceOrder = function () {
    return !this.isBlocked;
};

module.exports = mongoose.model('User', userSchema);
