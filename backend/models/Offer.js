const mongoose = require('mongoose');

/* =========================================================
   VALID BRANCHES
   ========================================================= */

const VALID_GYM_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

/* =========================================================
   OFFER SCHEMA
   ========================================================= */

const offerSchema = new mongoose.Schema({
    /* =====================================================
       GYM BRANCH
    ===================================================== */

    gymBranch: {
        type: String,
        enum: VALID_GYM_BRANCHES,
        required: true,
        trim: true,
    },

    /* =====================================================
       PUJA OFFER NAME
    =====================================================

       Examples:

       Puja Special
       Durga Puja Offer
       Puja Fitness Offer
    ===================================================== */

    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
    },

    /* =====================================================
       OFFER DURATION
    ===================================================== */

    durationMonths: {
        type: Number,
        required: true,
        min: 1,
    },

    /* =====================================================
       OFFER PRICE
    ===================================================== */

    offerPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    /* =====================================================
       OFFER START DATE
    ===================================================== */

    startDate: {
        type: Date,
        required: true,
    },

    /* =====================================================
       OFFER END DATE
    ===================================================== */

    endDate: {
        type: Date,
        required: true,
    },

    /* =====================================================
       DESCRIPTION
    ===================================================== */

    description: {
        type: String,
        trim: true,
        default: '',
        maxlength: 1000,
    },

    /* =====================================================
       BENEFITS
    ===================================================== */

    benefits: {
        type: [{
            type: String,
            trim: true,
        }, ],

        default: [],
    },

    /* =====================================================
       OPTIONAL IMAGE
    ===================================================== */

    image: {
        type: String,
        trim: true,
        default: '',
    },

    /* =====================================================
       ACTIVE STATUS
    ===================================================== */

    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

/* =========================================================
   DATE VALIDATION
   ========================================================= */

offerSchema.pre(
    'validate',
    function() {
        if (
            this.startDate &&
            this.endDate &&
            this.endDate < this.startDate
        ) {
            this.invalidate(
                'endDate',
                'Offer end date cannot be before the start date.'
            );
        }
    }
);

/* =========================================================
   DATABASE INDEXES
   ========================================================= */

/* ---------------------------------------------------------
   Branch + active offers
--------------------------------------------------------- */

offerSchema.index({
    gymBranch: 1,
    isActive: 1,
    startDate: 1,
    endDate: 1,
});

/* ---------------------------------------------------------
   Branch + offer name
--------------------------------------------------------- */

offerSchema.index({
    gymBranch: 1,
    name: 1,
    isActive: 1,
});

/* =========================================================
   MODEL
   ========================================================= */

module.exports = mongoose.model(
    'Offer',
    offerSchema
);