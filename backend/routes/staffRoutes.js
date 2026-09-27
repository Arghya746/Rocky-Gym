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
// MAIN ADMIN ROLES
// =====================================

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

// =====================================
// GET ALL RECEPTIONISTS
// GET /api/admin/staff
// =====================================

router.get(
    '/',
    protect,
    authorize(...MAIN_ADMIN_ROLES),
    getStaff
);

// =====================================
// UPDATE RECEPTIONIST BRANCHES
// PUT /api/admin/staff/:id/branches
// =====================================

router.put(
    '/:id/branches',
    protect,
    authorize(...MAIN_ADMIN_ROLES),
    updateStaffBranches
);

// =====================================
// UPDATE RECEPTIONIST PERMISSIONS
// PUT /api/admin/staff/:id/permissions
// =====================================

router.put(
    '/:id/permissions',
    protect,
    authorize(...MAIN_ADMIN_ROLES),
    updateStaffPermissions
);

// =====================================
// ACTIVATE / DEACTIVATE RECEPTIONIST
// PUT /api/admin/staff/:id/status
// =====================================

router.put(
    '/:id/status',
    protect,
    authorize(...MAIN_ADMIN_ROLES),
    updateStaffStatus
);

module.exports = router;