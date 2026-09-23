const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');
const {
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

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

   - Main admin: both branches
   - Receptionist: assigned branch only
   - Requires plans.view
   ========================================================= */

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('plans.view'),
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
    authorizeBranch,
    requirePermission('plans.view'),
    getAllPlans
);

/* =========================================================
   SINGLE PLAN
   GET /api/plans/:id
   ========================================================= */

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('plans.view'),
    getPlanById
);

/* =========================================================
   CREATE PLAN
   POST /api/plans

   Main admin:
     - Must provide a valid gymBranch

   Receptionist:
     - Uses their assigned branch
     - Cannot create for another branch
   ========================================================= */

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('plans.add'),
    createPlan
);

/* =========================================================
   UPDATE PLAN
   PUT /api/plans/:id
   ========================================================= */

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('plans.edit'),
    updatePlan
);

/* =========================================================
   DELETE / DEACTIVATE PLAN
   DELETE /api/plans/:id

   Controller performs soft delete.
   ========================================================= */

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('plans.delete'),
    deletePlan
);

module.exports = router;