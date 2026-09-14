const express = require('express');

const {
    getDashboardStats,
} = require('../controllers/dashboardController');

const {
    protect,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();


// =====================================
// DASHBOARD
// =====================================

// View dashboard statistics
router.get(
    '/stats',
    protect,
    requirePermission('members.view'),
    getDashboardStats
);

module.exports = router;