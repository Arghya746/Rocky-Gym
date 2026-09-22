const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
    getPlans,
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
} = require('../controllers/planController');

/* =========================================================
   ACTIVE PLANS
   GET /api/plans
   ========================================================= */

router.get(
    '/',
    protect,
    getPlans
);

/* =========================================================
   ALL PLANS
   GET /api/plans/all

   Includes active + inactive plans.
   ========================================================= */

router.get(
    '/all',
    protect,
    getAllPlans
);

/* =========================================================
   SINGLE PLAN
   GET /api/plans/:id
   ========================================================= */

router.get(
    '/:id',
    protect,
    getPlanById
);

/* =========================================================
   CREATE PLAN
   POST /api/plans
   ========================================================= */

router.post(
    '/',
    protect,
    createPlan
);

/* =========================================================
   UPDATE PLAN
   PUT /api/plans/:id
   ========================================================= */

router.put(
    '/:id',
    protect,
    updatePlan
);

/* =========================================================
   DELETE / DEACTIVATE PLAN
   DELETE /api/plans/:id

   Uses soft delete through the controller.
   ========================================================= */

router.delete(
    '/:id',
    protect,
    deletePlan
);

module.exports = router;