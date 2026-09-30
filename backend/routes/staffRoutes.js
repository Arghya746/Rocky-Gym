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

// ============================================================
// MAIN ADMIN ROLES
// ============================================================

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

// ============================================================
// GET ALL RECEPTIONISTS / STAFF
// GET /api/admin/staff
//
// Main Admin only.
// ============================================================

router.get(
    '/',
    protect,
    authorize(...MAIN_ADMIN_ROLES),
    getStaff
);

// ============================================================
// UPDATE STAFF BRANCHES
// PUT /api/admin/staff/:id/branches
//
// Main Admin only.
// ============================================================

router.put(
    '/:id/branches',
    protect,
    authorize(...MAIN_ADMIN_ROLES),
    updateStaffBranches
);

// ============================================================
// UPDATE STAFF PERMISSIONS
// PUT /api/admin/staff/:id/permissions
//
// Main Admin only.
//
// Available permission groups are handled by the
// staffController/Admin model.
//
// No "plans" permission.
// ============================================================

router.put(
    '/:id/permissions',
    protect,
    authorize(...MAIN_ADMIN_ROLES),
    updateStaffPermissions
);

// ============================================================
// ACTIVATE / DEACTIVATE STAFF
// PUT /api/admin/staff/:id/status
//
// Main Admin only.
// ============================================================

router.put(
    '/:id/status',
    protect,
    authorize(...MAIN_ADMIN_ROLES),
    updateStaffStatus
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;