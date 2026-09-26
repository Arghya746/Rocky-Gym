const express = require('express');

const {
    getStaff,
    updateStaffBranches,
    updateStaffPermissions,
    updateStaffStatus,
} = require('../controllers/staffController');

const {
    protect,
    authorize,
} = require('../middleware/authMiddleware');

const router = express.Router();


// =====================================
// STAFF MANAGEMENT
// MAIN ADMIN ONLY
// =====================================


// =====================================
// GET ALL RECEPTIONISTS
// GET /api/admin/staff
// =====================================

router.get(
    '/',
    protect,
    authorize('admin'),
    getStaff
);


// =====================================
// UPDATE RECEPTIONIST BRANCHES
// PUT /api/admin/staff/:id/branches
// =====================================

router.put(
    '/:id/branches',
    protect,
    authorize('admin'),
    updateStaffBranches
);


// =====================================
// UPDATE RECEPTIONIST PERMISSIONS
// PUT /api/admin/staff/:id/permissions
// =====================================

router.put(
    '/:id/permissions',
    protect,
    authorize('admin'),
    updateStaffPermissions
);


// =====================================
// ACTIVATE / DEACTIVATE RECEPTIONIST
// PUT /api/admin/staff/:id/status
// =====================================

router.put(
    '/:id/status',
    protect,
    authorize('admin'),
    updateStaffStatus
);


module.exports = router;