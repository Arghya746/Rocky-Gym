const express = require('express');

const {
    getStaff,
    updateStaffBranches,
    updateStaffPermissions,
    updateStaffStatus,
} = require('../controllers/staffController');

const {
    protect,
} = require('../middleware/authMiddleware');

const {
    MAIN_ADMIN_ROLES,
    RECEPTION_ROLES,
    normalizeRole,
    resolveAdminBranches,
} = require('../utils/branchAccess');

const router = express.Router();

// ============================================================
// STAFF MANAGEMENT AUTHORIZATION
// ============================================================
// Main admins have unrestricted access. Receptionist/staff users
// are allowed only when their account has at least one valid
// assigned branch. protect() remains responsible for JWT/auth.
// Branch-level record filtering remains in staffController.

const authorizeStaffManagement = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized.',
        });
    }

    const role = normalizeRole(
        req.adminRole || req.admin.role
    );

    if (MAIN_ADMIN_ROLES.includes(role)) {
        return next();
    }

    if (!RECEPTION_ROLES.includes(role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have permission.',
        });
    }

    const branches = resolveAdminBranches(req.admin);

    if (!branches.length) {
        return res.status(403).json({
            success: false,
            message: 'Your account is not assigned to a valid gym branch.',
        });
    }

    return next();
};

// ============================================================
// MAIN ADMIN ONLY MUTATIONS
// ============================================================

const authorizeMainAdmin = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized.',
        });
    }

    const role = normalizeRole(
        req.adminRole || req.admin.role
    );

    if (!MAIN_ADMIN_ROLES.includes(role)) {
        return res.status(403).json({
            success: false,
            message: 'Only the main admin can modify staff accounts.',
        });
    }

    return next();
};

// ============================================================
// ALLOWED STAFF MANAGEMENT ROLES
// ============================================================

const STAFF_MANAGEMENT_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
    'receptionist',
    'staff',
];

// ============================================================
// GET ALL RECEPTIONISTS / STAFF
// GET /api/admin/staff
//
// Main admin + assigned receptionist/staff.
// ============================================================

router.get(
    '/',
    protect,
    authorizeStaffManagement,
    getStaff
);

// ============================================================
// UPDATE STAFF BRANCHES
// PUT /api/admin/staff/:id/branches
//
// Main admin only.
// ============================================================

router.put(
    '/:id/branches',
    protect,
    authorizeMainAdmin,
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
// ============================================================

router.put(
    '/:id/permissions',
    protect,
    authorizeMainAdmin,
    updateStaffPermissions
);

// ============================================================
// ACTIVATE / DEACTIVATE STAFF
// PUT /api/admin/staff/:id/status
//
// Main admin only.
// ============================================================

router.put(
    '/:id/status',
    protect,
    authorizeMainAdmin,
    updateStaffStatus
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;