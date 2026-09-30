const mongoose = require('mongoose');

/* ============================================================
   VALID VALUES
   ============================================================ */

const VALID_GYM_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const VALID_PASS_TYPES = [
    'Daily Access',
    'Weekly Access',
];

/* ============================================================
   ACCESS PASS SCHEMA
   ============================================================ */

const accessPassSchema = new mongoose.Schema({
    /* --------------------------------------------------------
       GYM BRANCH
    -------------------------------------------------------- */

    gymBranch: {
        type: String,
        enum: VALID_GYM_BRANCHES,
        required: true,
        trim: true,
    },

    /* --------------------------------------------------------
       PASS TYPE
    --------------------------------------------------------

       Daily Access
       Weekly Access
    -------------------------------------------------------- */

    passType: {
        type: String,
        enum: VALID_PASS_TYPES,
        required: true,
        trim: true,
    },

    /* --------------------------------------------------------
       PRICE
    -------------------------------------------------------- */

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    /* --------------------------------------------------------
       DESCRIPTION
    -------------------------------------------------------- */

    description: {
        type: String,
        trim: true,
        default: '',
    },

    /* --------------------------------------------------------
       DURATION
    -------------------------------------------------------- */

    durationDays: {
        type: Number,
        enum: [1, 7],
        required: true,
    },

    /* --------------------------------------------------------
       ACTIVE STATUS
    -------------------------------------------------------- */

    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

/* ============================================================
   VALIDATE PASS / DURATION COMBINATION
   ============================================================ */

accessPassSchema.pre(
    'validate',
    function() {
        if (
            this.passType === 'Daily Access' &&
            this.durationDays !== 1
        ) {
            this.invalidate(
                'durationDays',
                'Daily Access must have a duration of 1 day.'
            );
        }

        if (
            this.passType === 'Weekly Access' &&
            this.durationDays !== 7
        ) {
            this.invalidate(
                'durationDays',
                'Weekly Access must have a duration of 7 days.'
            );
        }
    }
);

/* ============================================================
   DATABASE INDEXES
   ============================================================ */

accessPassSchema.index({
    gymBranch: 1,
    passType: 1,
    isActive: 1,
}, {
    unique: true,

    partialFilterExpression: {
        isActive: true,
    },

    name: 'unique_active_branch_pass_type',
});

accessPassSchema.index({
    gymBranch: 1,
    isActive: 1,
});

/* ============================================================
   MODEL
   ============================================================ */

module.exports =
    mongoose.model(
        'AccessPass',
        accessPassSchema
    );