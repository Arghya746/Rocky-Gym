const express = require('express');

const {
    protect,
    requirePermission,
} = require('../middleware/authMiddleware');

const {
    createContact,
    getContacts,
    getContactById,
    deleteContact,
} = require('../controllers/contactController');

const router = express.Router();


// ===============================
// POST - CREATE CONTACT ENQUIRY
// PUBLIC
// ===============================

router.post(
    '/',
    createContact
);


// ===============================
// GET - GET ALL CONTACT ENQUIRIES
// PROTECTED
// ===============================

router.get(
    '/',
    protect,
    requirePermission('enquiries.view'),
    getContacts
);


// ===============================
// GET - GET SINGLE CONTACT
// PROTECTED
// ===============================

router.get(
    '/:id',
    protect,
    requirePermission('enquiries.view'),
    getContactById
);


// ===============================
// DELETE - DELETE CONTACT ENQUIRY
// PROTECTED
// ===============================

router.delete(
    '/:id',
    protect,
    requirePermission('enquiries.delete'),
    deleteContact
);


// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;