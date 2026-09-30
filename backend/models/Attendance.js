const mongoose = require('mongoose');

/* =========================================================
   ATTENDANCE SCHEMA
   ========================================================= */

const attendanceSchema = new mongoose.Schema({
    /* =====================================================
       MEMBER
    ===================================================== */

    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },

    /* =====================================================
       GYM BRANCH
    ===================================================== */

    gymBranch: {
        type: String,
        enum: [
            'Kalyanpur',
            'Gopalpur',
        ],
        required: true,
        trim: true,
    },

    /* =====================================================
       NORMALIZED CALENDAR DAY
    =====================================================

       Format:

           YYYY-MM-DD

       Example:

           2026-09-23

       Used for daily uniqueness.
    ===================================================== */

    attendanceDay: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{4}-\d{2}-\d{2}$/,
    },

    /* =====================================================
       ATTENDANCE DATE / TIMESTAMP
    ===================================================== */

    date: {
        type: Date,
        required: true,
        default: Date.now,
    },

    /* =====================================================
       CHECK-IN TIME
    ===================================================== */

    checkInTime: {
        type: Date,
        default: null,
    },

    /* =====================================================
       CHECK-OUT TIME
    ===================================================== */

    checkOutTime: {
        type: Date,
        default: null,
    },

    /* =====================================================
       STATUS
    ===================================================== */

    status: {
        type: String,
        enum: [
            'Present',
            'Absent',
        ],
        default: 'Present',
    },
}, {
    timestamps: true,
});

/* =========================================================
   DATABASE INDEXES
   ========================================================= */

/*
 * Prevent duplicate attendance records for the same:
 *
 * member
 * +
 * branch
 * +
 * calendar day
 */

attendanceSchema.index({
    member: 1,
    gymBranch: 1,
    attendanceDay: 1,
}, {
    unique: true,
    name: 'unique_member_branch_attendance_day',
});

/* ---------------------------------------------------------
   BRANCH ATTENDANCE LISTING
--------------------------------------------------------- */

attendanceSchema.index({
    gymBranch: 1,
    attendanceDay: -1,
});

/* ---------------------------------------------------------
   MEMBER ATTENDANCE HISTORY
--------------------------------------------------------- */

attendanceSchema.index({
    member: 1,
    attendanceDay: -1,
});

/* =========================================================
   EXPORT
   ========================================================= */

module.exports =
    mongoose.model(
        'Attendance',
        attendanceSchema
    );