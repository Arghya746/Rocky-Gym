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


// =========================================
// GET ACTIVE PLANS
// =========================================

router.get(
    '/',
    protect,
    getPlans
);


// =========================================
// GET ALL PLANS
// =========================================

router.get(
    '/all',
    protect,
    getAllPlans
);


// =========================================
// GET SINGLE PLAN
// =========================================

router.get(
    '/:id',
    protect,
    getPlanById
);


// =========================================
// CREATE PLAN
// =========================================

router.post(
    '/',
    protect,
    createPlan
);


// =========================================
// UPDATE PLAN
// =========================================

router.put(
    '/:id',
    protect,
    updatePlan
);


// =========================================
// DELETE / DEACTIVATE PLAN
// =========================================

router.delete(
    '/:id',
    protect,
    deletePlan
);


module.exports = router;