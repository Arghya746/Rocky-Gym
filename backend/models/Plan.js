const mongoose = require('mongoose');

const VALID_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

/* =========================================================
   PLAN SCHEMA
   ========================================================= */

const planSchema = new mongoose.Schema({
    /* =====================================================
       GYM BRANCH
       ===================================================== */

    gymBranch: {
        type: String,
        enum: VALID_BRANCHES,
        required: true,
        trim: true,
    },

    /* =====================================================
       PLAN INFORMATION
       ===================================================== */

    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100,
    },

    durationMonths: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'Duration in months must be a whole number.',
        },
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
        maxlength: 500,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

/* =========================================================
   INDEXES
   ========================================================= */

/*
 * Branch + active status
 *
 * Used by:
 * GET /api/plans
 */
planSchema.index({
    gymBranch: 1,
    isActive: 1,
});

/*
 * Branch + duration + price
 *
 * Helps AdminDashboard sorting/filtering.
 */
planSchema.index({
    gymBranch: 1,
    durationMonths: 1,
    price: 1,
});

/*
 * Prevent duplicate ACTIVE plan names
 * within the same branch.
 *
 * Example:
 * Kalyanpur + Monthly + active
 *
 * cannot exist twice.
 *
 * Inactive plans are allowed to have
 * the same name.
 */
planSchema.index({
    gymBranch: 1,
    name: 1,
}, {
    unique: true,
    partialFilterExpression: {
        isActive: true,
    },
    name: 'unique_active_plan_name_per_branch',
});

/* =========================================================
   MODEL
   ========================================================= */

module.exports =
    mongoose.model('Plan', planSchema);