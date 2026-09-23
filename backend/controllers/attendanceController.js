const Attendance = require('../models/Attendance');
const Member = require('../models/Member');


// =========================================
// ALLOWED BRANCHES
// =========================================

const ALLOWED_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];


// =========================================
// NORMALIZE BRANCH
// =========================================

const normalizeBranch = (value) => {

    if (!value) {
        return null;
    }

    const normalized =
        String(value)
        .trim()
        .toLowerCase();

    if (normalized === 'kalyanpur') {
        return 'Kalyanpur';
    }

    if (normalized === 'gopalpur') {
        return 'Gopalpur';
    }

    return null;
};


// =========================================
// GET ACCESSIBLE BRANCH
// =========================================

const getAccessibleBranch = (req) => {

    // Main admin can manage both branches
    if (
        req.admin &&
        req.admin.role === 'admin'
    ) {
        return null;
    }

    // Receptionist can access only
    // their assigned branch
    if (
        req.admin &&
        req.admin.role === 'receptionist'
    ) {

        return normalizeBranch(
            req.admin.gymBranch
        );
    }

    return null;
};


// =========================================
// GET WRITE BRANCH
// =========================================
// Main admin:
//   Must provide a valid branch.
//
// Receptionist:
//   Always uses assigned branch.
//   Cannot override it.
// =========================================

const getWriteBranch = (req, requestedBranch) => {

    // =========================================
    // MAIN ADMIN
    // =========================================

    if (
        req.admin &&
        req.admin.role === 'admin'
    ) {

        return normalizeBranch(
            requestedBranch
        );
    }


    // =========================================
    // RECEPTIONIST
    // =========================================

    if (
        req.admin &&
        req.admin.role === 'receptionist'
    ) {

        return normalizeBranch(
            req.admin.gymBranch
        );
    }


    return null;
};


// =========================================
// MARK ATTENDANCE
// =========================================

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


        // =========================================
        // VALIDATION
        // =========================================

        if (!member) {

            return res.status(400).json({

                message: 'Member is required.',

            });
        }


        // =========================================
        // DETERMINE BRANCH
        // =========================================

        const selectedBranch =
            getWriteBranch(
                req,
                gymBranch
            );


        // =========================================
        // VALIDATE BRANCH
        // =========================================

        if (!selectedBranch) {

            if (
                req.admin &&
                req.admin.role === 'receptionist'
            ) {

                return res.status(403).json({

                    message: 'Your account is not assigned to a valid gym branch.',

                });
            }

            return res.status(400).json({

                message: 'A valid gym branch is required.',

            });
        }


        if (!ALLOWED_BRANCHES.includes(
                selectedBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        // =========================================
        // VERIFY MEMBER BELONGS TO SAME BRANCH
        // =========================================

        const memberRecord =
            await Member.findOne({

                _id: member,

                gymBranch: selectedBranch,

            });


        if (!memberRecord) {

            return res.status(400).json({

                message: 'Member not found in the selected gym branch.',

            });
        }


        // =========================================
        // CREATE ATTENDANCE
        // =========================================

        const attendance =
            await Attendance.create({

                gymBranch: selectedBranch,

                member,

                date,

                checkInTime,

                checkOutTime,

                status,

            });


        return res.status(201).json({

            message: 'Attendance marked successfully.',

            attendance,

        });

    } catch (error) {

        console.error(
            'Mark Attendance Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// GET ALL ATTENDANCE
// =========================================

const getAttendance = async(req, res) => {

    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // VALIDATE RECEPTIONIST BRANCH
        // =========================================

        if (
            req.admin &&
            req.admin.role === 'receptionist' &&
            !branch
        ) {

            return res.status(403).json({

                message: 'Your account is not assigned to a valid gym branch.',

            });
        }


        // =========================================
        // BUILD QUERY
        // =========================================

        const query =
            branch ?
            {
                gymBranch: branch,
            } :
            {};


        // =========================================
        // FETCH ATTENDANCE
        // =========================================

        const attendance =
            await Attendance.find(query)
            .populate(
                'member',
                'name phone email gymBranch'
            )
            .sort({
                date: -1,
            });


        return res.status(200).json({

            message: 'Attendance fetched successfully.',

            attendance,

        });

    } catch (error) {

        console.error(
            'Get Attendance Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// GET SINGLE ATTENDANCE
// =========================================

const getAttendanceById = async(req, res) => {

    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // VALIDATE RECEPTIONIST BRANCH
        // =========================================

        if (
            req.admin &&
            req.admin.role === 'receptionist' &&
            !branch
        ) {

            return res.status(403).json({

                message: 'Your account is not assigned to a valid gym branch.',

            });
        }


        // =========================================
        // BUILD QUERY
        // =========================================

        const query = {

            _id: req.params.id,

        };


        // Receptionist can only access
        // attendance from assigned branch.
        if (branch) {

            query.gymBranch =
                branch;
        }


        // =========================================
        // FIND ATTENDANCE
        // =========================================

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


        return res.status(200).json({

            attendance,

        });

    } catch (error) {

        console.error(
            'Get Attendance Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// UPDATE ATTENDANCE
// =========================================

const updateAttendance = async(req, res) => {

    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // VALIDATE RECEPTIONIST BRANCH
        // =========================================

        if (
            req.admin &&
            req.admin.role === 'receptionist' &&
            !branch
        ) {

            return res.status(403).json({

                message: 'Your account is not assigned to a valid gym branch.',

            });
        }


        // =========================================
        // FIND EXISTING ATTENDANCE
        // =========================================

        const query = {

            _id: req.params.id,

        };


        if (branch) {

            query.gymBranch =
                branch;
        }


        const existingAttendance =
            await Attendance.findOne(query);


        if (!existingAttendance) {

            return res.status(404).json({

                message: 'Attendance record not found.',

            });
        }


        // =========================================
        // BUILD UPDATE DATA
        // =========================================

        const updateData = {
            ...req.body,
        };


        let updateBranch;


        // =========================================
        // RECEPTIONIST
        // =========================================

        if (branch) {

            // Never allow receptionist to
            // change the attendance branch.
            updateBranch =
                branch;

        } else {

            // Main admin can change branch,
            // but only to a valid branch.
            updateBranch =
                normalizeBranch(
                    updateData.gymBranch ||
                    existingAttendance.gymBranch
                );

            if (!updateBranch) {

                return res.status(400).json({

                    message: 'A valid gym branch is required.',

                });
            }
        }


        // =========================================
        // VALIDATE BRANCH
        // =========================================

        if (!ALLOWED_BRANCHES.includes(
                updateBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        updateData.gymBranch =
            updateBranch;


        // =========================================
        // VERIFY MEMBER IF MEMBER IS CHANGED
        // =========================================

        if (updateData.member) {

            const memberRecord =
                await Member.findOne({

                    _id: updateData.member,

                    gymBranch: updateBranch,

                });


            if (!memberRecord) {

                return res.status(400).json({

                    message: 'Member not found in the selected gym branch.',

                });
            }
        }


        // =========================================
        // UPDATE ATTENDANCE
        // =========================================

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


        return res.status(200).json({

            message: 'Attendance updated successfully.',

            attendance,

        });

    } catch (error) {

        console.error(
            'Update Attendance Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// DELETE ATTENDANCE
// =========================================

const deleteAttendance = async(req, res) => {

    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // VALIDATE RECEPTIONIST BRANCH
        // =========================================

        if (
            req.admin &&
            req.admin.role === 'receptionist' &&
            !branch
        ) {

            return res.status(403).json({

                message: 'Your account is not assigned to a valid gym branch.',

            });
        }


        // =========================================
        // BUILD QUERY
        // =========================================

        const query = {

            _id: req.params.id,

        };


        // Receptionist can delete only
        // attendance belonging to their branch.
        if (branch) {

            query.gymBranch =
                branch;
        }


        // =========================================
        // DELETE ATTENDANCE
        // =========================================

        const attendance =
            await Attendance.findOneAndDelete(
                query
            );


        if (!attendance) {

            return res.status(404).json({

                message: 'Attendance record not found.',

            });
        }


        return res.status(200).json({

            message: 'Attendance deleted successfully.',

        });

    } catch (error) {

        console.error(
            'Delete Attendance Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// EXPORT CONTROLLERS
// =========================================

module.exports = {

    markAttendance,

    getAttendance,

    getAttendanceById,

    updateAttendance,

    deleteAttendance,

};