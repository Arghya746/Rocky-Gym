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


// ======================================================
// ADMIN AUTHENTICATION
// ======================================================

// Public login
router.post(
    '/login',
    loginAdmin
);


// ======================================================
// STAFF / ADMIN REGISTRATION
// ======================================================
//
// Only an authenticated main admin can create accounts.
//
// IMPORTANT:
// Do NOT make /register public.
//
// Main admin:
//     role = admin
//
// Receptionist:
//     role = receptionist
//     gymBranch = Kalyanpur / Gopalpur
//

router.post(
    '/register',
    protect,
    authorize('admin'),
    registerAdmin
);


// ======================================================
// PROTECTED PROFILE
// ======================================================
//
// Returns the currently authenticated account.
//
// Branch and role information comes from the
// authenticated database account.
//

router.get(
    '/profile',
    protect,
    (req, res) => {

        return res.status(200).json({

            message: 'Admin authentication successful.',

            admin: {
                id: req.admin._id,
                name: req.admin.name,
                email: req.admin.email,
                role: req.admin.role,
                gymBranch: req.admin.gymBranch,
                status: req.admin.status,
                permissions: req.admin.permissions,
            },

        });
    }
);


module.exports = router;