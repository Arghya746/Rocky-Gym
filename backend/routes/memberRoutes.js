const express = require('express');

const {
    addMember,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember,
} = require('../controllers/memberController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();


// ===============================
// MEMBER ROUTES
// ===============================

// Add member
router.post('/', protect, addMember);

// Get all members
router.get('/', protect, getMembers);

// Get single member
router.get('/:id', protect, getMemberById);

// Update member
router.put('/:id', protect, updateMember);

// Delete member
router.delete('/:id', protect, deleteMember);


module.exports = router;