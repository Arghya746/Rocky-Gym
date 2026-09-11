const express = require('express');

const {
    addPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
} = require('../controllers/paymentController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();


// ===============================
// PAYMENT ROUTES
// ===============================

// Add payment
router.post('/', protect, addPayment);

// Get all payments
router.get('/', protect, getPayments);

// Get single payment
router.get('/:id', protect, getPaymentById);

// Update payment
router.put('/:id', protect, updatePayment);

// Delete payment
router.delete('/:id', protect, deletePayment);


module.exports = router;