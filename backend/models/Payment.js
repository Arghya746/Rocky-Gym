const mongoose = require('mongoose');

/* =========================================================
   VALID BRANCHES
   ========================================================= */

const VALID_GYM_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

/* =========================================================
   PAYMENT SCHEMA
   ========================================================= */

const paymentSchema = new mongoose.Schema({
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
       MEMBER
    ===================================================== */

    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },

    /* =====================================================
       INVOICE NUMBER
    ===================================================== */

    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    /* =====================================================
       PAYMENT AMOUNT
    ===================================================== */

    amount: {
        type: Number,
        required: true,
        min: 0,
    },

    /* =====================================================
       PAYMENT METHOD
    ===================================================== */

    paymentMethod: {
        type: String,
        enum: [
            'Cash',
            'UPI',
            'Card',
            'Bank Transfer',
        ],
        required: true,
    },

    /* =====================================================
       PAYMENT DATE
    ===================================================== */

    paymentDate: {
        type: Date,
        default: Date.now,
    },

    /* =====================================================
       PAYMENT STATUS
    ===================================================== */

    status: {
        type: String,
        enum: [
            'Paid',
            'Pending',
            'Failed',
        ],
        default: 'Paid',
    },

    /* =====================================================
       NOTES
    ===================================================== */

    notes: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

/* =========================================================
   DATABASE INDEXES
   ========================================================= */

/* ---------------------------------------------------------
   Branch payment listing
--------------------------------------------------------- */

paymentSchema.index({
    gymBranch: 1,
    paymentDate: -1,
});

/* ---------------------------------------------------------
   Branch + member payment history
--------------------------------------------------------- */

paymentSchema.index({
    gymBranch: 1,
    member: 1,
    paymentDate: -1,
});

/* ---------------------------------------------------------
   Branch + payment status
--------------------------------------------------------- */

paymentSchema.index({
    gymBranch: 1,
    status: 1,
});

/* =========================================================
   MODEL
   ========================================================= */

module.exports = mongoose.model(
    'Payment',
    paymentSchema
);