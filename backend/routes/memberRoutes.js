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
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// MEMBERS
// ============================================================

// ============================================================
// GET ALL MEMBERS
// GET /api/members
//
// Main Admin:
// - Can access Kalyanpur
// - Can access Gopalpur
// - Can access all branches
//
// Receptionist / Staff:
// - Can access assigned branch(es)
//
// Permission:
// members.view
// ============================================================

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('members.view'),
    getMembers
);

// ============================================================
// ADD MEMBER
// POST /api/members
//
// Main Admin:
// - Must select/provide a valid gymBranch
//
// Receptionist / Staff:
// - Uses an assigned branch
//
// Permission:
// members.add
// ============================================================

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('members.add'),
    addMember
);

// ============================================================
// GET SINGLE MEMBER
// GET /api/members/:id
//
// Branch isolation is handled by authentication +
// controller branch filtering.
// ============================================================

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('members.view'),
    getMemberById
);

// ============================================================
// UPDATE MEMBER
// PUT /api/members/:id
//
// Main Admin:
// - Can update members from either branch
// - Can move a member between valid branches
//
// Receptionist / Staff:
// - Can update members from assigned branch(es)
// - Cannot move a member outside their assigned branches
//
// Permission:
// members.edit
// ============================================================

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('members.edit'),
    updateMember
);

// ============================================================
// DELETE MEMBER
// DELETE /api/members/:id
//
// Branch isolation is handled by controller.
//
// Permission:
// members.delete
// ============================================================

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('members.delete'),
    deleteMember
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;