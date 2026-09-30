const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

const {
    VALID_BRANCHES: ALLOWED_BRANCHES,
    normalizeBranch,
    getActiveBranch,
    resolveWriteBranch,
} = require('../utils/branchAccess');

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

const BRANCH_USER_ROLES = [
    'receptionist',
    'staff',
];

const getRole = (req) =>
    String(req.admin.role || '')
    .trim()
    .toLowerCase();

const isMainAdmin = (req) =>
    MAIN_ADMIN_ROLES.includes(getRole(req));

const isBranchUser = (req) =>
    BRANCH_USER_ROLES.includes(getRole(req));

const getAccessibleBranch = (req) =>
    getActiveBranch(req);

const isValidObjectId = (value) => {
    return /^[a-fA-F0-9]{24}$/.test(String(value || ''));
};


// ============================================================
// NORMALIZE ATTENDANCE DATE
// ============================================================

const normalizeAttendanceDate = (value) => {
    if (!value) {
        return null;
    }

    const parsedDate =
        new Date(value);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return null;
    }

    const year =
        parsedDate.getFullYear();

    const month =
        String(
            parsedDate.getMonth() + 1
        ).padStart(2, '0');

    const day =
        String(
            parsedDate.getDate()
        ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};


// ============================================================
// PARSE VALID DATE
// ============================================================

const parseValidDate = (value) => {
    if (!value) {
        return null;
    }

    const parsedDate =
        new Date(value);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return null;
    }

    return parsedDate;
};


// ============================================================
// VALIDATE ROLE
// ============================================================

const validateRole = (req, res) => {
    if (!req.admin) {
        res.status(401).json({
            message: 'Not authorized.',
        });

        return false;
    }

    const role = getRole(req);

    if (!MAIN_ADMIN_ROLES.includes(role) &&
        !BRANCH_USER_ROLES.includes(role)
    ) {
        res.status(403).json({
            message: 'You are not authorized to access attendance records.',
        });

        return false;
    }

    return true;
};


// ============================================================
// VALIDATE BRANCH
// ============================================================

const validateUserBranch = (
    req,
    res,
    branch
) => {
    if (
        isBranchUser(req) &&
        !branch
    ) {
        res.status(403).json({
            message: 'Your account is not assigned to a valid gym branch.',
        });

        return false;
    }

    return true;
};


// ============================================================
// VALIDATE ATTENDANCE TIMES
// ============================================================

const validateAttendanceTimes = (
    checkInTime,
    checkOutTime
) => {
    let parsedCheckIn = null;
    let parsedCheckOut = null;

    // --------------------------------------------------------
    // CHECK-IN
    // --------------------------------------------------------

    if (
        checkInTime !== undefined &&
        checkInTime !== null &&
        checkInTime !== ''
    ) {
        parsedCheckIn =
            parseValidDate(
                checkInTime
            );

        if (!parsedCheckIn) {
            return {
                valid: false,
                message: 'Invalid check-in time.',
            };
        }
    }

    // --------------------------------------------------------
    // CHECK-OUT
    // --------------------------------------------------------

    if (
        checkOutTime !== undefined &&
        checkOutTime !== null &&
        checkOutTime !== ''
    ) {
        parsedCheckOut =
            parseValidDate(
                checkOutTime
            );

        if (!parsedCheckOut) {
            return {
                valid: false,
                message: 'Invalid check-out time.',
            };
        }
    }

    // --------------------------------------------------------
    // COMPARE
    // --------------------------------------------------------

    if (
        parsedCheckIn &&
        parsedCheckOut &&
        parsedCheckOut < parsedCheckIn
    ) {
        return {
            valid: false,
            message: 'Check-out time cannot be earlier than check-in time.',
        };
    }

    return {
        valid: true,
        checkInTime: parsedCheckIn,
        checkOutTime: parsedCheckOut,
    };
};


// ============================================================
// GET WRITE BRANCH
// ============================================================

const getAttendanceWriteBranch = (
    req,
    requestedBranch
) => {
    const result =
        resolveWriteBranch(
            req,
            requestedBranch
        );

    if (result.error) {
        return {
            error: result.error,
            status: result.status || 400,
        };
    }

    const branch =
        normalizeBranch(
            result.branch
        );

    if (!branch) {
        return {
            error: isBranchUser(req) ?
                'Your account is not assigned to a valid gym branch.' : 'A valid gym branch is required.',
            status: isBranchUser(req) ?
                403 : 400,
        };
    }

    if (!ALLOWED_BRANCHES.includes(branch)) {
        return {
            error: 'Invalid gym branch.',
            status: 400,
        };
    }

    return {
        branch,
    };
};


// ============================================================
// MARK ATTENDANCE
// ============================================================

const markAttendance = async(
    req,
    res
) => {
    try {
        if (!validateRole(req, res)) {
            return;
        }

        const {
            member,
            date,
            checkInTime,
            checkOutTime,
            status,
            gymBranch,
        } = req.body;

        // --------------------------------------------------------
        // MEMBER
        // --------------------------------------------------------

        if (!member) {
            return res.status(400).json({
                message: 'Member is required.',
            });
        }

        if (!isValidObjectId(member)) {
            return res.status(400).json({
                message: 'Invalid member ID.',
            });
        }

        // --------------------------------------------------------
        // DATE
        // --------------------------------------------------------

        const sourceDate =
            date || new Date();

        const attendanceDay =
            normalizeAttendanceDate(
                sourceDate
            );

        if (!attendanceDay) {
            return res.status(400).json({
                message: 'Invalid attendance date.',
            });
        }

        const attendanceDate =
            parseValidDate(
                sourceDate
            );

        if (!attendanceDate) {
            return res.status(400).json({
                message: 'Invalid attendance date.',
            });
        }

        // --------------------------------------------------------
        // TIMES
        // --------------------------------------------------------

        const timeValidation =
            validateAttendanceTimes(
                checkInTime,
                checkOutTime
            );

        if (!timeValidation.valid) {
            return res.status(400).json({
                message: timeValidation.message,
            });
        }

        // --------------------------------------------------------
        // BRANCH
        // --------------------------------------------------------

        const branchResult =
            getAttendanceWriteBranch(
                req,
                gymBranch
            );

        if (branchResult.error) {
            return res
                .status(
                    branchResult.status
                )
                .json({
                    message: branchResult.error,
                });
        }

        const selectedBranch =
            branchResult.branch;

        // --------------------------------------------------------
        // MEMBER BRANCH CHECK
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // DUPLICATE
        // --------------------------------------------------------

        const existingAttendance =
            await Attendance.findOne({
                member,
                gymBranch: selectedBranch,
                attendanceDay,
            });

        if (existingAttendance) {
            return res.status(409).json({
                message: 'Attendance has already been marked for this member on this calendar day.',

                attendance: existingAttendance,
            });
        }

        // --------------------------------------------------------
        // CREATE
        // --------------------------------------------------------

        const attendance =
            await Attendance.create({
                member,

                gymBranch: selectedBranch,

                attendanceDay,

                date: attendanceDate,

                checkInTime: timeValidation.checkInTime,

                checkOutTime: timeValidation.checkOutTime,

                status,
            });

        return res.status(201).json({
            message: 'Attendance marked successfully.',

            attendance,
        });

    } catch (error) {
        console.error(
            'Mark Attendance Error:',
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Attendance has already been marked for this member on this calendar day.',
            });
        }

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// ============================================================
// GET ALL ATTENDANCE
// ============================================================

const getAttendance = async(
    req,
    res
) => {
    try {
        if (!validateRole(req, res)) {
            return;
        }

        const branch =
            getAccessibleBranch(req);

        if (!validateUserBranch(
                req,
                res,
                branch
            )) {
            return;
        }

        const query =
            branch ? {
                gymBranch: branch,
            } : {};

        const attendance =
            await Attendance.find(query)
            .populate(
                'member',
                'name phone email gymBranch'
            )
            .sort({
                attendanceDay: -1,
                checkInTime: -1,
            });

        return res.status(200).json({
            message: 'Attendance fetched successfully.',
            attendance,
        });

    } catch (error) {
        console.error(
            'Get Attendance Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// ============================================================
// GET SINGLE ATTENDANCE
// ============================================================

const getAttendanceById = async(
    req,
    res
) => {
    try {
        if (!validateRole(req, res)) {
            return;
        }

        if (!isValidObjectId(
                req.params.id
            )) {
            return res.status(400).json({
                message: 'Invalid attendance ID.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        if (!validateUserBranch(
                req,
                res,
                branch
            )) {
            return;
        }

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch =
                branch;
        }

        const attendance =
            await Attendance.findOne(
                query
            ).populate(
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
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// ============================================================
// UPDATE ATTENDANCE
// ============================================================

const updateAttendance = async(
    req,
    res
) => {
    try {
        if (!validateRole(req, res)) {
            return;
        }

        if (!isValidObjectId(
                req.params.id
            )) {
            return res.status(400).json({
                message: 'Invalid attendance ID.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        if (!validateUserBranch(
                req,
                res,
                branch
            )) {
            return;
        }

        // --------------------------------------------------------
        // FIND EXISTING
        // --------------------------------------------------------

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch =
                branch;
        }

        const existingAttendance =
            await Attendance.findOne(
                query
            );

        if (!existingAttendance) {
            return res.status(404).json({
                message: 'Attendance record not found.',
            });
        }

        const updateData = {
            ...req.body,
        };

        delete updateData._id;

        // --------------------------------------------------------
        // DATE
        // --------------------------------------------------------

        const requestedDate =
            updateData.date !== undefined ?
            updateData.date :
            existingAttendance.date;

        const normalizedDay =
            normalizeAttendanceDate(
                requestedDate
            );

        if (!normalizedDay) {
            return res.status(400).json({
                message: 'Invalid attendance date.',
            });
        }

        const normalizedDate =
            parseValidDate(
                requestedDate
            );

        if (!normalizedDate) {
            return res.status(400).json({
                message: 'Invalid attendance date.',
            });
        }

        // --------------------------------------------------------
        // TIMES
        // --------------------------------------------------------

        const requestedCheckIn =
            updateData.checkInTime !==
            undefined ?
            updateData.checkInTime :
            existingAttendance.checkInTime;

        const requestedCheckOut =
            updateData.checkOutTime !==
            undefined ?
            updateData.checkOutTime :
            existingAttendance.checkOutTime;

        const timeValidation =
            validateAttendanceTimes(
                requestedCheckIn,
                requestedCheckOut
            );

        if (!timeValidation.valid) {
            return res.status(400).json({
                message: timeValidation.message,
            });
        }

        // --------------------------------------------------------
        // BRANCH
        // --------------------------------------------------------

        let updateBranch;

        if (isBranchUser(req)) {
            updateBranch =
                branch;

        } else if (isMainAdmin(req)) {
            updateBranch =
                normalizeBranch(
                    updateData.gymBranch ||
                    existingAttendance.gymBranch
                );
        } else {
            return res.status(403).json({
                message: 'You do not have permission to update attendance.',
            });
        }

        if (!updateBranch ||
            !ALLOWED_BRANCHES.includes(
                updateBranch
            )
        ) {
            return res.status(400).json({
                message: 'A valid gym branch is required.',
            });
        }

        // --------------------------------------------------------
        // MEMBER
        // --------------------------------------------------------

        const updateMember =
            updateData.member ||
            existingAttendance.member;

        if (!isValidObjectId(
                updateMember
            )) {
            return res.status(400).json({
                message: 'Invalid member ID.',
            });
        }

        const memberRecord =
            await Member.findOne({
                _id: updateMember,
                gymBranch: updateBranch,
            });

        if (!memberRecord) {
            return res.status(400).json({
                message: 'Member not found in the selected gym branch.',
            });
        }

        // --------------------------------------------------------
        // DUPLICATE
        // --------------------------------------------------------

        const duplicateAttendance =
            await Attendance.findOne({
                member: updateMember,

                gymBranch: updateBranch,

                attendanceDay: normalizedDay,

                _id: {
                    $ne: existingAttendance._id,
                },
            });

        if (duplicateAttendance) {
            return res.status(409).json({
                message: 'Attendance already exists for this member on this calendar day.',

                attendance: duplicateAttendance,
            });
        }

        // --------------------------------------------------------
        // FORCE SAFE VALUES
        // --------------------------------------------------------

        updateData.member =
            updateMember;

        updateData.gymBranch =
            updateBranch;

        updateData.attendanceDay =
            normalizedDay;

        updateData.date =
            normalizedDate;

        updateData.checkInTime =
            timeValidation.checkInTime;

        updateData.checkOutTime =
            timeValidation.checkOutTime;

        // --------------------------------------------------------
        // UPDATE
        // --------------------------------------------------------

        const attendance =
            await Attendance.findByIdAndUpdate(
                req.params.id,
                updateData, {
                    new: true,
                    runValidators: true,
                }
            ).populate(
                'member',
                'name phone email gymBranch'
            );

        if (!attendance) {
            return res.status(404).json({
                message: 'Attendance record not found.',
            });
        }

        return res.status(200).json({
            message: 'Attendance updated successfully.',
            attendance,
        });

    } catch (error) {
        console.error(
            'Update Attendance Error:',
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Attendance already exists for this member on this calendar day.',
            });
        }

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// ============================================================
// DELETE ATTENDANCE
// ============================================================

const deleteAttendance = async(
    req,
    res
) => {
    try {
        if (!validateRole(req, res)) {
            return;
        }

        if (!isValidObjectId(
                req.params.id
            )) {
            return res.status(400).json({
                message: 'Invalid attendance ID.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        if (!validateUserBranch(
                req,
                res,
                branch
            )) {
            return;
        }

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch =
                branch;
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

        return res.status(200).json({
            message: 'Attendance deleted successfully.',
        });

    } catch (error) {
        console.error(
            'Delete Attendance Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    markAttendance,
    getAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
};