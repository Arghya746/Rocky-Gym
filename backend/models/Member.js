const mongoose = require('mongoose');

/* =========================================================
   VALID BRANCHES
   ========================================================= */

const VALID_GYM_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

/* =========================================================
   MEMBER SCHEMA
   ========================================================= */

const memberSchema = new mongoose.Schema({
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
       PERSONAL INFORMATION
    ===================================================== */

    name: {
        type: String,
        required: true,
        trim: true,
    },

    phone: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
    },

    age: {
        type: Number,
        min: 1,
        max: 120,
    },

    gender: {
        type: String,
        enum: [
            'Male',
            'Female',
            'Other',
        ],
    },

    /* =====================================================
       PUJA OFFER
    =====================================================

       A member may optionally be registered using
       a current Puja promotional offer.

       This is NOT a membership-plan reference.
    ===================================================== */

    membershipOffer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        default: null,
    },

    /* =====================================================
       ACCESS / MEMBERSHIP PERIOD
    ===================================================== */

    membershipStartDate: {
        type: Date,
        required: true,
    },

    membershipEndDate: {
        type: Date,
        required: true,
    },

    /* =====================================================
       AMOUNT
    ===================================================== */

    amount: {
        type: Number,
        required: true,
        min: 0,
    },

    /* =====================================================
       MEMBER STATUS
    ===================================================== */

    status: {
        type: String,
        enum: [
            'Active',
            'Expired',
        ],
        default: 'Active',
    },
}, {
    timestamps: true,
});

/* =========================================================
   DATABASE INDEXES
   ========================================================= */

/* ---------------------------------------------------------
   Branch + member listing
--------------------------------------------------------- */

memberSchema.index({
    gymBranch: 1,
    createdAt: -1,
});

/* ---------------------------------------------------------
   Branch + status
--------------------------------------------------------- */

memberSchema.index({
    gymBranch: 1,
    status: 1,
});

/* ---------------------------------------------------------
   Phone lookup
--------------------------------------------------------- */

memberSchema.index({
    gymBranch: 1,
    phone: 1,
});

/* =========================================================
   MODEL
   ========================================================= */

module.exports = mongoose.model(
    'Member',
    memberSchema
);