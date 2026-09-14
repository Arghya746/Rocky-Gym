const express = require('express');

const {
    addMember,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember,
} = require('../controllers/memberController');

const {
    protect,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();


// =====================================
// MEMBERS
// =====================================

// View members
router.get(
    '/',
    protect,
    requirePermission('members.view'),
    getMembers
);

// Add member
router.post(
    '/',
    protect,
    requirePermission('members.add'),
    addMember
);

// View single member
router.get(
    '/:id',
    protect,
    requirePermission('members.view'),
    getMemberById
);

// Edit member
router.put(
    '/:id',
    protect,
    requirePermission('members.edit'),
    updateMember
);

// Delete member
router.delete(
    '/:id',
    protect,
    requirePermission('members.delete'),
    deleteMember
);

module.exports = router;