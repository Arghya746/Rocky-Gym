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

/* =========================================================
   WORKOUTS
   ========================================================= */

/* =========================================================
   VIEW WORKOUTS
   GET /api/workouts

   Main Admin:
   - Can access both branches

   Receptionist:
   - Can access assigned branch only

   Permission:
   - workouts.view
   ========================================================= */

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('workouts.view'),
    getWorkouts
);


/* =========================================================
   ADD WORKOUT
   POST /api/workouts

   Main Admin:
   - Must provide a valid gymBranch

   Receptionist:
   - Uses assigned branch

   Permission:
   - workouts.add
   ========================================================= */

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('workouts.add'),
    addWorkout
);


/* =========================================================
   VIEW SINGLE WORKOUT
   GET /api/workouts/:id
   ========================================================= */

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('workouts.view'),
    getWorkoutById
);


/* =========================================================
   EDIT WORKOUT
   PUT /api/workouts/:id

   Permission:
   - workouts.edit
   ========================================================= */

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('workouts.edit'),
    updateWorkout
);


/* =========================================================
   DELETE WORKOUT
   DELETE /api/workouts/:id

   Permission:
   - workouts.delete
   ========================================================= */

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('workouts.delete'),
    deleteWorkout
);


/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;