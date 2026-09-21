const express = require('express');

const {
    protect,
    requirePermission,
} = require('../middleware/authMiddleware');

const {
    getOffers,
    getAllOffers,
    getOffersByPlan,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
} = require('../controllers/offerController');

const router = express.Router();


// =====================================
// GET PUBLIC ACTIVE OFFERS
// =====================================

router.get(
    '/public',
    getOffers
);


// =====================================
// GET ACTIVE OFFERS
// ADMIN / RECEPTIONIST
// =====================================

router.get(
    '/',
    protect,
    requirePermission('offers.view'),
    getOffers
);


// =====================================
// GET ALL OFFERS
// ADMIN / RECEPTIONIST
// =====================================

router.get(
    '/all',
    protect,
    requirePermission('offers.view'),
    getAllOffers
);


// =====================================
// GET OFFERS BY PLAN
// =====================================

router.get(
    '/plan/:planId',
    protect,
    requirePermission('offers.view'),
    getOffersByPlan
);


// =====================================
// GET SINGLE OFFER
// =====================================

router.get(
    '/:id',
    protect,
    requirePermission('offers.view'),
    getOfferById
);


// =====================================
// CREATE OFFER
// =====================================

router.post(
    '/',
    protect,
    requirePermission('offers.add'),
    createOffer
);


// =====================================
// UPDATE OFFER
// =====================================

router.put(
    '/:id',
    protect,
    requirePermission('offers.edit'),
    updateOffer
);


// =====================================
// DEACTIVATE OFFER
// =====================================

router.delete(
    '/:id',
    protect,
    requirePermission('offers.delete'),
    deleteOffer
);


module.exports = router;