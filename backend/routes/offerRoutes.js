const express = require('express');

const {
    getPublicOffers,
    getOffers,
    getAllOffers,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
} = require('../controllers/offerController');

const {
    protect,
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// PUBLIC OFFERS
// ============================================================
// GET /api/offers/public
//
// Public endpoint.
// No JWT required.
//
// Used by the public gym website.
// ============================================================

router.get(
    '/public',
    getPublicOffers
);

// ============================================================
// PROTECTED OFFERS
// ============================================================
// GET /api/offers
//
// Shows active/relevant offers according to the controller's
// branch filtering.
//
// Permission:
// offers.view
// ============================================================

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('offers.view'),
    getOffers
);

// ============================================================
// ALL OFFERS
// ============================================================
// GET /api/offers/all
//
// Used when admin needs active + inactive offers.
//
// Permission:
// offers.view
// ============================================================

router.get(
    '/all',
    protect,
    authorizeBranch,
    requirePermission('offers.view'),
    getAllOffers
);

// ============================================================
// SINGLE OFFER
// ============================================================
// GET /api/offers/:id
//
// IMPORTANT:
// This stays after /public and /all.
// ============================================================

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('offers.view'),
    getOfferById
);

// ============================================================
// CREATE PUJA OFFER
// ============================================================
// POST /api/offers
//
// Permission:
// offers.add
// ============================================================

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('offers.add'),
    createOffer
);

// ============================================================
// UPDATE PUJA OFFER
// ============================================================
// PUT /api/offers/:id
//
// Permission:
// offers.edit
// ============================================================

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('offers.edit'),
    updateOffer
);

// ============================================================
// DELETE / DEACTIVATE OFFER
// ============================================================
// DELETE /api/offers/:id
//
// Permission:
// offers.delete
// ============================================================

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('offers.delete'),
    deleteOffer
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;