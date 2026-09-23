const express = require('express');

const {
    protect,
    authorizeBranch,
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

   IMPORTANT:
   Use a dedicated public controller handler here if the
   frontend needs to display offers without login.

   Do NOT use the protected getOffers handler unless it
   explicitly supports unauthenticated requests.
   ========================================================= */

// router.get(
//     '/public',
//     getPublicOffers
// );


/* =========================================================
   ACTIVE OFFERS
   GET /api/offers

   Main Admin:
   - Can access both branches

   Receptionist:
   - Can access assigned branch only

   Permission:
   - offers.view
   ========================================================= */

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('offers.view'),
    getOffers
);


/* =========================================================
   ALL OFFERS
   GET /api/offers/all

   Includes:
   - Active offers
   - Inactive offers

   Branch isolation is enforced.
   ========================================================= */

router.get(
    '/all',
    protect,
    authorizeBranch,
    requirePermission('offers.view'),
    getAllOffers
);


/* =========================================================
   OFFERS BY PLAN
   GET /api/offers/plan/:planId

   Branch isolation is enforced.

   Example:
   /api/offers/plan/64abc123...
   ========================================================= */

router.get(
    '/plan/:planId',
    protect,
    authorizeBranch,
    requirePermission('offers.view'),
    getOffersByPlan
);


/* =========================================================
   SINGLE OFFER
   GET /api/offers/:id

   Branch isolation is enforced.
   ========================================================= */

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('offers.view'),
    getOfferById
);


/* =========================================================
   CREATE OFFER
   POST /api/offers

   Main Admin:
   - Must provide a valid gymBranch

   Receptionist:
   - Uses assigned branch
   - Cannot create an offer for another branch

   Permission:
   - offers.add
   ========================================================= */

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('offers.add'),
    createOffer
);


/* =========================================================
   UPDATE OFFER
   PUT /api/offers/:id

   Main Admin:
   - Can edit offers from either branch

   Receptionist:
   - Can edit only assigned branch
   - Cannot switch branch

   Permission:
   - offers.edit
   ========================================================= */

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('offers.edit'),
    updateOffer
);


/* =========================================================
   DELETE / DEACTIVATE OFFER
   DELETE /api/offers/:id

   Soft-delete is handled by the controller.

   Permission:
   - offers.delete
   ========================================================= */

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('offers.delete'),
    deleteOffer
);

module.exports = router;