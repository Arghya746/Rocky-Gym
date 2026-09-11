const express = require('express');

const {
    registerAdmin,
    loginAdmin,
} = require('../controllers/adminController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();


// ===============================
// ADMIN AUTH
// ===============================

// Register
router.post('/register', registerAdmin);

// Login
router.post('/login', loginAdmin);


// ===============================
// PROTECTED TEST ROUTE
// ===============================

router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        message: 'Admin authentication successful.',
        admin: req.admin,
    });
});


module.exports = router;