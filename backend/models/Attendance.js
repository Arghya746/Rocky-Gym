const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },

    date: {
        type: Date,
        required: true,
        default: Date.now,
    },

    checkInTime: {
        type: Date,
        default: null,
    },

    checkOutTime: {
        type: Date,
        default: null,
    },

    status: {
        type: String,
        enum: ['Present', 'Absent'],
        default: 'Present',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Attendance', attendanceSchema);