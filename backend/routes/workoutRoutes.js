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
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();


// =====================================
// WORKOUTS
// =====================================

// View workouts
router.get(
    '/',
    protect,
    requirePermission('workouts.view'),
    getWorkouts
);

// Add workout
router.post(
    '/',
    protect,
    requirePermission('workouts.add'),
    addWorkout
);

// View single workout
router.get(
    '/:id',
    protect,
    requirePermission('workouts.view'),
    getWorkoutById
);

// Edit workout
router.put(
    '/:id',
    protect,
    requirePermission('workouts.edit'),
    updateWorkout
);

// Delete workout
router.delete(
    '/:id',
    protect,
    requirePermission('workouts.delete'),
    deleteWorkout
);

module.exports = router;