const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    // =========================================
    // MEMBER
    // =========================================

    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },

    // =========================================
    // GYM BRANCH
    // =========================================

    gymBranch: {
        type: String,
        enum: ['Kalyanpur', 'Gopalpur'],
        required: true,
    },

    // =========================================
    // NORMALIZED CALENDAR DAY
    // =========================================
    // Format:
    // YYYY-MM-DD
    //
    // Example:
    // 2026-09-23
    //
    // This is used for daily uniqueness.
    // =========================================

    attendanceDay: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{4}-\d{2}-\d{2}$/,
    },

    // =========================================
    // ATTENDANCE DATE / TIMESTAMP
    // =========================================

    date: {
        type: Date,
        required: true,
        default: Date.now,
    },

    // =========================================
    // CHECK-IN TIME
    // =========================================

    checkInTime: {
        type: Date,
        default: null,
    },

    // =========================================
    // CHECK-OUT TIME
    // =========================================

    checkOutTime: {
        type: Date,
        default: null,
    },

    // =========================================
    // STATUS
    // =========================================

    status: {
        type: String,
        enum: ['Present', 'Absent'],
        default: 'Present',
    },
}, {
    timestamps: true,
});

// =========================================
// DATABASE INDEXES
// =========================================

// Prevent the same member from having
// multiple attendance records on the
// same calendar day.
//
// Branch is included for additional
// branch-level data isolation.
attendanceSchema.index({
    member: 1,
    gymBranch: 1,
    attendanceDay: 1,
}, {
    unique: true,
    name: 'unique_member_branch_attendance_day',
});

// Branch attendance listing.
attendanceSchema.index({
    gymBranch: 1,
    attendanceDay: -1,
});

// Member attendance history.
attendanceSchema.index({
    member: 1,
    attendanceDay: -1,
});

module.exports = mongoose.model(
    'Attendance',
    attendanceSchema
);