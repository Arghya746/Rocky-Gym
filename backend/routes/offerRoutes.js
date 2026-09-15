const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
    getOffers,
    getAllOffers,
    getOffersByPlan,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
} = require('../controllers/offerController');


// =========================================
// GET ACTIVE OFFERS
// =========================================

router.get(
    '/',
    protect,
    getOffers
);


// =========================================
// GET ALL OFFERS
// =========================================

router.get(
    '/all',
    protect,
    getAllOffers
);


// =========================================
// GET OFFERS BY PLAN
// =========================================

router.get(
    '/plan/:planId',
    protect,
    getOffersByPlan
);


// =========================================
// GET SINGLE OFFER
// =========================================

router.get(
    '/:id',
    protect,
    getOfferById
);


// =========================================
// CREATE OFFER
// =========================================

router.post(
    '/',
    protect,
    createOffer
);


// =========================================
// UPDATE OFFER
// =========================================

router.put(
    '/:id',
    protect,
    updateOffer
);


// =========================================
// DEACTIVATE OFFER
// =========================================

router.delete(
    '/:id',
    protect,
    deleteOffer
);


module.exports = router;