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
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// ATTENDANCE
// ============================================================

// ============================================================
// MARK ATTENDANCE
// POST /api/attendance
//
// Main Admin:
// - Must provide/select a valid gymBranch
//
// Receptionist / Staff:
// - Uses an assigned branch
//
// Permission:
// attendance.add
// ============================================================

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('attendance.add'),
    markAttendance
);

// ============================================================
// GET ATTENDANCE
// GET /api/attendance
//
// Main Admin:
// - Can access both branches
//
// Receptionist / Staff:
// - Can access assigned branch(es)
//
// Permission:
// attendance.view
// ============================================================

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('attendance.view'),
    getAttendance
);

// ============================================================
// GET SINGLE ATTENDANCE
// GET /api/attendance/:id
//
// Permission:
// attendance.view
// ============================================================

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('attendance.view'),
    getAttendanceById
);

// ============================================================
// UPDATE ATTENDANCE
// PUT /api/attendance/:id
//
// Permission:
// attendance.edit
// ============================================================

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('attendance.edit'),
    updateAttendance
);

// ============================================================
// DELETE ATTENDANCE
// DELETE /api/attendance/:id
//
// Permission:
// attendance.delete
// ============================================================

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('attendance.delete'),
    deleteAttendance
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;