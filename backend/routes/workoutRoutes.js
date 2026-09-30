const express = require('express');

const {
    addWorkout,
    getWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout,
} = require('../controllers/workoutController');

const {
    protect,
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// WORKOUTS
// ============================================================

// ============================================================
// GET ALL WORKOUTS
// GET /api/workouts
//
// Main Admin:
// - Can access both branches
//
// Receptionist / Staff:
// - Can access assigned branch(es)
//
// Permission:
// workouts.view
// ============================================================

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('workouts.view'),
    getWorkouts
);

// ============================================================
// ADD WORKOUT
// POST /api/workouts
//
// Main Admin:
// - Must provide/select a valid gymBranch
//
// Receptionist / Staff:
// - Uses an assigned branch
//
// Permission:
// workouts.add
// ============================================================

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('workouts.add'),
    addWorkout
);

// ============================================================
// GET SINGLE WORKOUT
// GET /api/workouts/:id
//
// Permission:
// workouts.view
// ============================================================

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('workouts.view'),
    getWorkoutById
);

// ============================================================
// UPDATE WORKOUT
// PUT /api/workouts/:id
//
// Main Admin:
// - Can update records across valid branches
//
// Receptionist / Staff:
// - Restricted to assigned branch(es)
//
// Permission:
// workouts.edit
// ============================================================

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('workouts.edit'),
    updateWorkout
);

// ============================================================
// DELETE WORKOUT
// DELETE /api/workouts/:id
//
// Permission:
// workouts.delete
// ============================================================

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('workouts.delete'),
    deleteWorkout
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;