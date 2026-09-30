const express = require('express');

const {
    protect,
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

const {
    createContact,
    getContacts,
    getContactById,
    deleteContact,
} = require('../controllers/contactController');

const router = express.Router();

// ============================================================
// CREATE CONTACT ENQUIRY
// ============================================================
// POST /api/contact
//
// PUBLIC
//
// The public website can submit an enquiry without logging in.
// ============================================================

router.post(
    '/',
    createContact
);

// ============================================================
// GET ALL CONTACT ENQUIRIES
// ============================================================
// GET /api/contact
//
// Main Admin:
// - Can access both branches
//
// Receptionist / Staff:
// - Access according to assigned branch(es)
//
// Permission:
// enquiries.view
// ============================================================

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('enquiries.view'),
    getContacts
);

// ============================================================
// GET SINGLE CONTACT ENQUIRY
// ============================================================
// GET /api/contact/:id
//
// Permission:
// enquiries.view
// ============================================================

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('enquiries.view'),
    getContactById
);

// ============================================================
// DELETE CONTACT ENQUIRY
// ============================================================
// DELETE /api/contact/:id
//
// Permission:
// enquiries.delete
// ============================================================

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('enquiries.delete'),
    deleteContact
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;