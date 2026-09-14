const express = require('express');

const {
    addPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
} = require('../controllers/paymentController');

const {
    protect,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();


// =====================================
// PAYMENTS
// =====================================

// View payments
router.get(
    '/',
    protect,
    requirePermission('payments.view'),
    getPayments
);

// Add payment
router.post(
    '/',
    protect,
    requirePermission('payments.add'),
    addPayment
);

// View single payment
router.get(
    '/:id',
    protect,
    requirePermission('payments.view'),
    getPaymentById
);

// Edit payment
router.put(
    '/:id',
    protect,
    requirePermission('payments.edit'),
    updatePayment
);

// Delete payment
router.delete(
    '/:id',
    protect,
    requirePermission('payments.delete'),
    deletePayment
);

module.exports = router;