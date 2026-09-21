const Attendance = require('../models/Attendance');


// ===============================
// GET ACCESSIBLE BRANCH
// ===============================

const getAccessibleBranch = (req) => {

    // Main admin can manage both branches
    if (req.admin && req.admin.role === 'admin') {
        return null;
    }

    // Receptionist is restricted to assigned branch
    if (req.admin && req.admin.gymBranch) {
        return req.admin.gymBranch;
    }

    // Fallback for old accounts
    return 'Kalyanpur';
};

// ===============================
// MARK ATTENDANCE
// ===============================

const markAttendance = async(req, res) => {
    try {

        const {
            member,
            date,
            checkInTime,
            checkOutTime,
            status,
            gymBranch,
        } = req.body;


        // ===============================
        // VALIDATION
        // ===============================

        if (!member) {

            return res.status(400).json({

                message: 'Member is required.',

            });
        }


        // ===============================
        // DETERMINE BRANCH
        // ===============================

        let selectedBranch;

        if (req.admin && req.admin.role === 'admin') {

            // Main admin can select branch
            selectedBranch =
                gymBranch || 'Kalyanpur';

        } else {

            // Receptionist uses assigned branch
            selectedBranch =
                (req.admin && req.admin.gymBranch) ?
                req.admin.gymBranch :
                'Kalyanpur';
        }


        // ===============================
        // VALIDATE BRANCH
        // ===============================

        const allowedBranches = [
            'Kalyanpur',
            'Gopalpur',
        ];


        if (!allowedBranches.includes(
                selectedBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        // ===============================
        // CREATE ATTENDANCE
        // ===============================

        const attendance =
            await Attendance.create({

                gymBranch: selectedBranch,

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

        console.error(
            'Mark Attendance Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// GET ALL ATTENDANCE
// ===============================

const getAttendance = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD QUERY
        // ===============================

        const query = branch ? { gymBranch: branch } : {};


        const attendance =
            await Attendance.find(query)
            .populate(
                'member',
                'name phone email gymBranch'
            )
            .sort({
                date: -1,
            });


        res.status(200).json({

            message: 'Attendance fetched successfully.',

            attendance,

        });

    } catch (error) {

        console.error(
            'Get Attendance Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// GET SINGLE ATTENDANCE
// ===============================

const getAttendanceById = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD QUERY
        // ===============================

        const query = {
            _id: req.params.id,
        };


        if (branch) {
            query.gymBranch = branch;
        }


        const attendance =
            await Attendance.findOne(query)
            .populate(
                'member',
                'name phone email gymBranch'
            );


        if (!attendance) {

            return res.status(404).json({

                message: 'Attendance record not found.',

            });
        }


        res.status(200).json({

            attendance,

        });

    } catch (error) {

        console.error(
            'Get Attendance Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// UPDATE ATTENDANCE
// ===============================

const updateAttendance = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // FIND ATTENDANCE
        // ===============================

        const query = {
            _id: req.params.id,
        };


        if (branch) {
            query.gymBranch = branch;
        }


        const existingAttendance =
            await Attendance.findOne(query);


        if (!existingAttendance) {

            return res.status(404).json({

                message: 'Attendance record not found.',

            });
        }


        // ===============================
        // PREVENT RECEPTIONIST
        // FROM CHANGING BRANCH
        // ===============================

        let updateData = {
            ...req.body,
        };


        if (branch) {

            updateData.gymBranch =
                branch;

        } else if (!updateData.gymBranch) {

            updateData.gymBranch =
                existingAttendance.gymBranch;
        }


        // ===============================
        // VALIDATE BRANCH
        // ===============================

        const allowedBranches = [
            'Kalyanpur',
            'Gopalpur',
        ];


        if (!allowedBranches.includes(
                updateData.gymBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        // ===============================
        // UPDATE
        // ===============================

        const attendance =
            await Attendance.findByIdAndUpdate(

                req.params.id,

                updateData,

                {
                    new: true,
                    runValidators: true,
                }

            ).populate(
                'member',
                'name phone email gymBranch'
            );


        res.status(200).json({

            message: 'Attendance updated successfully.',

            attendance,

        });

    } catch (error) {

        console.error(
            'Update Attendance Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// DELETE ATTENDANCE
// ===============================

const deleteAttendance = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD QUERY
        // ===============================

        const query = {
            _id: req.params.id,
        };


        if (branch) {
            query.gymBranch = branch;
        }


        const attendance =
            await Attendance.findOneAndDelete(
                query
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

        console.error(
            'Delete Attendance Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// EXPORT CONTROLLERS
// ===============================

module.exports = {

    markAttendance,

    getAttendance,

    getAttendanceById,

    updateAttendance,

    deleteAttendance,

};