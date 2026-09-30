const express = require('express');

const {
    getPublicAccessPasses,
    getAccessPasses,
    getAllAccessPasses,
    getAccessPassById,
    createAccessPass,
    updateAccessPass,
    deleteAccessPass,
} = require('../controllers/accessPassController');

const {
    protect,
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// PUBLIC ACCESS PASSES
// ============================================================
// GET /api/access-passes/public
//
// Public endpoint.
// No JWT required.
//
// Shows Daily Access / Weekly Access products.
// ============================================================

router.get(
    '/public',
    getPublicAccessPasses
);

// ============================================================
// GET ACTIVE ACCESS PASSES
// ============================================================
// GET /api/access-passes
//
// Permission:
// accessPasses.view
// ============================================================

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('accessPasses.view'),
    getAccessPasses
);

// ============================================================
// GET ALL ACCESS PASSES
// ============================================================
// GET /api/access-passes/all
//
// Includes inactive records where supported by controller.
//
// Permission:
// accessPasses.view
// ============================================================

router.get(
    '/all',
    protect,
    authorizeBranch,
    requirePermission('accessPasses.view'),
    getAllAccessPasses
);

// ============================================================
// GET SINGLE ACCESS PASS
// ============================================================
// GET /api/access-passes/:id
//
// IMPORTANT:
// This stays after /public and /all.
// ============================================================

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('accessPasses.view'),
    getAccessPassById
);

// ============================================================
// CREATE ACCESS PASS
// ============================================================
// POST /api/access-passes
//
// Permission:
// accessPasses.add
//
// Products:
// - Daily Access
// - Weekly Access
// ============================================================

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('accessPasses.add'),
    createAccessPass
);

// ============================================================
// UPDATE ACCESS PASS
// ============================================================
// PUT /api/access-passes/:id
//
// Permission:
// accessPasses.edit
// ============================================================

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('accessPasses.edit'),
    updateAccessPass
);

// ============================================================
// DELETE / DEACTIVATE ACCESS PASS
// ============================================================
// DELETE /api/access-passes/:id
//
// Permission:
// accessPasses.delete
// ============================================================

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('accessPasses.delete'),
    deleteAccessPass
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;