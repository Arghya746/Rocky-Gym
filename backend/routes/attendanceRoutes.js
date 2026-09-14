const express = require('express');

const {
    markAttendance,
    getAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
} = require('../controllers/attendanceController');

const {
    protect,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();


// =====================================
// ATTENDANCE
// =====================================

// Mark attendance
router.post(
    '/',
    protect,
    requirePermission('attendance.add'),
    markAttendance
);

// View attendance
router.get(
    '/',
    protect,
    requirePermission('attendance.view'),
    getAttendance
);

// View single attendance record
router.get(
    '/:id',
    protect,
    requirePermission('attendance.view'),
    getAttendanceById
);

// Edit attendance
router.put(
    '/:id',
    protect,
    requirePermission('attendance.edit'),
    updateAttendance
);

// Delete attendance
router.delete(
    '/:id',
    protect,
    requirePermission('attendance.delete'),
    deleteAttendance
);

module.exports = router;