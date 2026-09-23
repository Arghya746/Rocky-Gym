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

/* =========================================================
   ATTENDANCE
   ========================================================= */

/* =========================================================
   MARK ATTENDANCE
   POST /api/attendance

   Main Admin:
   - Must provide valid gymBranch

   Receptionist:
   - Uses assigned branch

   Permission:
   - attendance.add
   ========================================================= */

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('attendance.add'),
    markAttendance
);


/* =========================================================
   VIEW ATTENDANCE
   GET /api/attendance

   Main Admin:
   - Both branches

   Receptionist:
   - Assigned branch only

   Permission:
   - attendance.view
   ========================================================= */

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('attendance.view'),
    getAttendance
);


/* =========================================================
   VIEW SINGLE ATTENDANCE RECORD
   GET /api/attendance/:id
   ========================================================= */

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('attendance.view'),
    getAttendanceById
);


/* =========================================================
   EDIT ATTENDANCE
   PUT /api/attendance/:id

   Permission:
   - attendance.edit
   ========================================================= */

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('attendance.edit'),
    updateAttendance
);


/* =========================================================
   DELETE ATTENDANCE
   DELETE /api/attendance/:id

   Permission:
   - attendance.delete
   ========================================================= */

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('attendance.delete'),
    deleteAttendance
);


/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;