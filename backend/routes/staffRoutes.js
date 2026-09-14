const express = require('express');

const {
    getStaff,
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
// OWNER / ADMIN ONLY
// =====================================

// Get all receptionists
router.get(
    '/',
    protect,
    authorize('admin'),
    getStaff
);


// Update receptionist permissions
router.put(
    '/:id/permissions',
    protect,
    authorize('admin'),
    updateStaffPermissions
);


// Activate / deactivate receptionist
router.put(
    '/:id/status',
    protect,
    authorize('admin'),
    updateStaffStatus
);


module.exports = router;