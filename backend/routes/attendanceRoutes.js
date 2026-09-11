const express = require('express');

const {
    markAttendance,
    getAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
} = require('../controllers/attendanceController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, markAttendance);
router.get('/', protect, getAttendance);
router.get('/:id', protect, getAttendanceById);
router.put('/:id', protect, updateAttendance);
router.delete('/:id', protect, deleteAttendance);

module.exports = router;