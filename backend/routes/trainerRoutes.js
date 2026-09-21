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
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();


// =====================================
// TRAINERS
// =====================================


// Get all trainers
router.get(
    '/',
    protect,
    requirePermission('trainers.view'),
    getTrainers
);


// Create trainer
router.post(
    '/',
    protect,
    requirePermission('trainers.add'),
    createTrainer
);


// Get single trainer
router.get(
    '/:id',
    protect,
    requirePermission('trainers.view'),
    getTrainerById
);


// Update trainer
router.put(
    '/:id',
    protect,
    requirePermission('trainers.edit'),
    updateTrainer
);


// Delete trainer
router.delete(
    '/:id',
    protect,
    requirePermission('trainers.delete'),
    deleteTrainer
);


module.exports = router;