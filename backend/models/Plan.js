const mongoose = require('mongoose');

const VALID_BRANCHES = ['Kalyanpur', 'Gopalpur'];

const planSchema = new mongoose.Schema({
    // =========================================
    // GYM BRANCH
    // =========================================

    gymBranch: {
        type: String,
        enum: VALID_BRANCHES,
        required: true,
        trim: true,
    },

    // =========================================
    // PLAN INFORMATION
    // =========================================

    name: {
        type: String,
        required: true,
        trim: true,
    },

    durationMonths: {
        type: Number,
        required: true,
        min: 1,
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    description: {
        type: String,
        trim: true,
        default: '',
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// =========================================
// INDEXES
// =========================================

// Helps branch-based plan queries in AdminDashboard
planSchema.index({
    gymBranch: 1,
    isActive: 1,
});

// Helps branch + plan-name lookups
planSchema.index({
    gymBranch: 1,
    name: 1,
});

module.exports = mongoose.model('Plan', planSchema);