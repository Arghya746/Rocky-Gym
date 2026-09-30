const express = require('express');

const {
    registerAdmin,
    loginAdmin,
} = require('../controllers/adminController');

const {
    protect,
    authorize,
} = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// ADMIN LOGIN
// ============================================================
// POST /api/admin/login
//
// Public endpoint.
// JWT is not required for login.
// ============================================================

router.post(
    '/login',
    loginAdmin
);

// ============================================================
// ADMIN / RECEPTIONIST REGISTRATION
// ============================================================
// POST /api/admin/register
//
// Only main administrators can create:
// - Admin accounts
// - Receptionist accounts
//
// Supported main-admin roles:
// - admin
// - main_admin
// - super_admin
// ============================================================

router.post(
    '/register',
    protect,
    authorize(
        'admin',
        'main_admin',
        'super_admin'
    ),
    registerAdmin
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;