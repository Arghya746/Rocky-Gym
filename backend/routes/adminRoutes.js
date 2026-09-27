const express = require('express');

const {
    registerAdmin,
    loginAdmin,
} = require('../controllers/adminController');

const router = express.Router();

/* ============================================================
   ADMIN AUTHENTICATION
   ============================================================ */

/*
   POST /api/admin/login

   Used by:
   - Main Admin
   - Receptionist
   - Other supported admin/staff accounts

   Controller:
   loginAdmin
*/
router.post('/login', loginAdmin);


/*
   POST /api/admin/register

   Creates a new admin/staff account.

   Controller:
   registerAdmin
*/
router.post('/register', registerAdmin);


/* ============================================================
   EXPORT
   ============================================================ */

module.exports = router;