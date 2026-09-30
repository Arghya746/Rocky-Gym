const mongoose = require('mongoose');

/* =========================================================
   VALID BRANCHES
   ========================================================= */

const VALID_GYM_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

/* =========================================================
   TRAINER SCHEMA
   ========================================================= */

const trainerSchema = new mongoose.Schema({
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
       BASIC INFORMATION
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

    /* =====================================================
       PROFESSIONAL INFORMATION
    ===================================================== */

    specialization: {
        type: String,
        required: true,
        trim: true,
    },

    experience: {
        type: Number,
        default: 0,
        min: 0,
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
       PROFILE
    ===================================================== */

    photo: {
        type: String,
        trim: true,
        default: '',
    },

    bio: {
        type: String,
        trim: true,
        default: '',
    },

    /* =====================================================
       STATUS
    ===================================================== */

    status: {
        type: String,
        enum: [
            'Active',
            'Inactive',
        ],
        default: 'Active',
    },
}, {
    timestamps: true,
});

/* =========================================================
   DATABASE INDEXES
   ========================================================= */

trainerSchema.index({
    gymBranch: 1,
    status: 1,
});

trainerSchema.index({
    gymBranch: 1,
    createdAt: -1,
});

/* =========================================================
   MODEL
   ========================================================= */

module.exports = mongoose.model(
    'Trainer',
    trainerSchema
);