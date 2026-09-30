const mongoose = require('mongoose');

/* =========================================================
   VALID BRANCHES
   ========================================================= */

const VALID_GYM_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

/* =========================================================
   WORKOUT SCHEMA
   ========================================================= */

const workoutSchema = new mongoose.Schema({
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
       WORKOUT INFORMATION
    ===================================================== */

    workoutName: {
        type: String,
        required: true,
        trim: true,
    },

    workoutType: {
        type: String,
        enum: [
            'Strength',
            'Cardio',
            'Weight Loss',
            'Muscle Building',
            'Flexibility',
            'General Fitness',
        ],
        required: true,
    },

    /* =====================================================
       EXERCISES
    ===================================================== */

    exercises: [{
        name: {
            type: String,
            required: true,
            trim: true,
        },

        sets: {
            type: Number,
            min: 0,
        },

        reps: {
            type: Number,
            min: 0,
        },

        duration: {
            type: Number,
            min: 0,
        },

        notes: {
            type: String,
            trim: true,
            default: '',
        },
    }, ],

    /* =====================================================
       DATES
    ===================================================== */

    startDate: {
        type: Date,
        default: Date.now,
    },

    endDate: {
        type: Date,
    },

    /* =====================================================
       STATUS
    ===================================================== */

    status: {
        type: String,
        enum: [
            'Active',
            'Completed',
        ],
        default: 'Active',
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

workoutSchema.index({
    gymBranch: 1,
    createdAt: -1,
});

workoutSchema.index({
    gymBranch: 1,
    member: 1,
    startDate: -1,
});

workoutSchema.index({
    gymBranch: 1,
    status: 1,
});

/* =========================================================
   MODEL
   ========================================================= */

module.exports = mongoose.model(
    'Workout',
    workoutSchema
);