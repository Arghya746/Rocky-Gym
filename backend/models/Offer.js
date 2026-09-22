const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({

    // =========================================
    // GYM BRANCH
    // =========================================

    gymBranch: {
        type: String,
        enum: ['Kalyanpur', 'Gopalpur'],
        required: true,
        trim: true,
    },


    // =========================================
    // OFFER INFORMATION
    // =========================================

    name: {
        type: String,
        required: true,
        trim: true,
    },

    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },

    offerPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    startDate: {
        type: Date,
        required: true,
    },

    endDate: {
        type: Date,
        required: true,
    },

    description: {
        type: String,
        trim: true,
        default: '',
    },

    benefits: {
        type: [String],
        default: [],
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
 * Helps queries such as:
 *
 * - Get active offers for Kalyanpur
 * - Get active offers for Gopalpur
 * - Find currently running offers
 */
offerSchema.index({
    gymBranch: 1,
    isActive: 1,
    startDate: 1,
    endDate: 1,
});


/*
 * Helps find offers belonging to a particular plan.
 */
offerSchema.index({
    gymBranch: 1,
    plan: 1,
    isActive: 1,
});


/* =========================================================
   MODEL
   ========================================================= */

module.exports = mongoose.model('Offer', offerSchema);