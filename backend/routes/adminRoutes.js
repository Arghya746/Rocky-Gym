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

// ===============================
// ADMIN AUTH
// ===============================

router.post('/login', loginAdmin);

// ===============================
// STAFF REGISTRATION
// Only existing admin/owner can
// create receptionist accounts
// ===============================

router.post(
    '/register',
    protect,
    authorize('admin'),
    registerAdmin
);

// ===============================
// PROTECTED PROFILE
// ===============================

router.get(
    '/profile',
    protect,
    (req, res) => {
        res.status(200).json({
            message: 'Admin authentication successful.',
            admin: req.admin,
        });
    }
);

module.exports = router;