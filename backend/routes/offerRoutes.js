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

/* =========================================================
   PUBLIC ACTIVE OFFERS
   GET /api/offers/public

   No authentication required.
   ========================================================= */

router.get(
    '/public',
    getOffers
);

/* =========================================================
   ACTIVE OFFERS
   GET /api/offers

   Requires:
   - Login
   - offers.view permission
   ========================================================= */

router.get(
    '/',
    protect,
    requirePermission('offers.view'),
    getOffers
);

/* =========================================================
   ALL OFFERS
   GET /api/offers/all

   Includes active + inactive offers.
   ========================================================= */

router.get(
    '/all',
    protect,
    requirePermission('offers.view'),
    getAllOffers
);

/* =========================================================
   OFFERS BY PLAN
   GET /api/offers/plan/:planId
   ========================================================= */

router.get(
    '/plan/:planId',
    protect,
    requirePermission('offers.view'),
    getOffersByPlan
);

/* =========================================================
   SINGLE OFFER
   GET /api/offers/:id
   ========================================================= */

router.get(
    '/:id',
    protect,
    requirePermission('offers.view'),
    getOfferById
);

/* =========================================================
   CREATE OFFER
   POST /api/offers

   Requires:
   - Login
   - offers.add permission
   ========================================================= */

router.post(
    '/',
    protect,
    requirePermission('offers.add'),
    createOffer
);

/* =========================================================
   UPDATE OFFER
   PUT /api/offers/:id

   Requires:
   - Login
   - offers.edit permission
   ========================================================= */

router.put(
    '/:id',
    protect,
    requirePermission('offers.edit'),
    updateOffer
);

/* =========================================================
   DEACTIVATE OFFER
   DELETE /api/offers/:id

   Soft-delete is handled by the controller.
   ========================================================= */

router.delete(
    '/:id',
    protect,
    requirePermission('offers.delete'),
    deleteOffer
);

module.exports = router;