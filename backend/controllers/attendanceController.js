const Attendance = require('../models/Attendance');

const markAttendance = async(req, res) => {
    try {
        const {
            member,
            date,
            checkInTime,
            checkOutTime,
            status,
        } = req.body;

        if (!member) {
            return res.status(400).json({
                message: 'Member is required.',
            });
        }

        const attendance = await Attendance.create({
            member,
            date,
            checkInTime,
            checkOutTime,
            status,
        });

        res.status(201).json({
            message: 'Attendance marked successfully.',
            attendance,
        });

    } catch (error) {
        console.error('Mark Attendance Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


const getAttendance = async(req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate('member', 'name phone email')
            .sort({ date: -1 });

        res.status(200).json({
            message: 'Attendance fetched successfully.',
            attendance,
        });

    } catch (error) {
        console.error('Get Attendance Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


const getAttendanceById = async(req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id)
            .populate('member', 'name phone email');

        if (!attendance) {
            return res.status(404).json({
                message: 'Attendance record not found.',
            });
        }

        res.status(200).json({
            attendance,
        });

    } catch (error) {
        console.error('Get Attendance Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


const updateAttendance = async(req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body, {
                new: true,
                runValidators: true,
            }
        ).populate('member', 'name phone email');

        if (!attendance) {
            return res.status(404).json({
                message: 'Attendance record not found.',
            });
        }

        res.status(200).json({
            message: 'Attendance updated successfully.',
            attendance,
        });

    } catch (error) {
        console.error('Update Attendance Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


const deleteAttendance = async(req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(
            req.params.id
        );

        if (!attendance) {
            return res.status(404).json({
                message: 'Attendance record not found.',
            });
        }

        res.status(200).json({
            message: 'Attendance deleted successfully.',
        });

    } catch (error) {
        console.error('Delete Attendance Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


module.exports = {
    markAttendance,
    getAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
};