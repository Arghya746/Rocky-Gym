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
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();

/* =========================================================
   PAYMENTS
   ========================================================= */

/* =========================================================
   VIEW ALL PAYMENTS
   GET /api/payments

   Main Admin:
   - Both branches

   Receptionist:
   - Assigned branch only

   Permission:
   - payments.view
   ========================================================= */

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('payments.view'),
    getPayments
);


/* =========================================================
   ADD PAYMENT
   POST /api/payments

   Main Admin:
   - Must provide valid gymBranch

   Receptionist:
   - Uses assigned branch

   Permission:
   - payments.add
   ========================================================= */

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('payments.add'),
    addPayment
);


/* =========================================================
   VIEW SINGLE PAYMENT
   GET /api/payments/:id
   ========================================================= */

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('payments.view'),
    getPaymentById
);


/* =========================================================
   EDIT PAYMENT
   PUT /api/payments/:id

   Permission:
   - payments.edit
   ========================================================= */

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('payments.edit'),
    updatePayment
);


/* =========================================================
   DELETE PAYMENT
   DELETE /api/payments/:id

   Permission:
   - payments.delete
   ========================================================= */

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('payments.delete'),
    deletePayment
);


/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;