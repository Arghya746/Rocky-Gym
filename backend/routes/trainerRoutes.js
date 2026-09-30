const express = require('express');

const {
    createTrainer,
    getTrainers,
    getTrainerById,
    updateTrainer,
    deleteTrainer,
} = require('../controllers/trainerController');

const {
    protect,
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// TRAINERS
// ============================================================

// ============================================================
// GET ALL TRAINERS
// GET /api/trainers
//
// Main Admin:
// - Can access both branches
//
// Receptionist / Staff:
// - Can access assigned branch(es)
//
// Permission:
// trainers.view
// ============================================================

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('trainers.view'),
    getTrainers
);

// ============================================================
// CREATE TRAINER
// POST /api/trainers
//
// Main Admin:
// - Can create for Kalyanpur or Gopalpur
//
// Receptionist / Staff:
// - Can create only in assigned branch
//
// Permission:
// trainers.add
// ============================================================

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('trainers.add'),
    createTrainer
);

// ============================================================
// GET SINGLE TRAINER
// GET /api/trainers/:id
//
// Permission:
// trainers.view
// ============================================================

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('trainers.view'),
    getTrainerById
);

// ============================================================
// UPDATE TRAINER
// PUT /api/trainers/:id
//
// Permission:
// trainers.edit
// ============================================================

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('trainers.edit'),
    updateTrainer
);

// ============================================================
// DELETE TRAINER
// DELETE /api/trainers/:id
//
// Permission:
// trainers.delete
// ============================================================

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('trainers.delete'),
    deleteTrainer
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;