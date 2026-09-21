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
// GET ALL MEMBERS
// =====================================

router.get(
    '/',
    protect,
    requirePermission('members.view'),
    getMembers
);


// =====================================
// ADD MEMBER
// =====================================

router.post(
    '/',
    protect,
    requirePermission('members.add'),
    addMember
);


// =====================================
// GET SINGLE MEMBER
// =====================================

router.get(
    '/:id',
    protect,
    requirePermission('members.view'),
    getMemberById
);


// =====================================
// UPDATE MEMBER
// =====================================

router.put(
    '/:id',
    protect,
    requirePermission('members.edit'),
    updateMember
);


// =====================================
// DELETE MEMBER
// =====================================

router.delete(
    '/:id',
    protect,
    requirePermission('members.delete'),
    deleteMember
);


// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;