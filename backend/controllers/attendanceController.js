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
// ROLES
// =========================================

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

const BRANCH_USER_ROLES = [
    'receptionist',
    'staff',
];

// =========================================
// NORMALIZE ROLE
// =========================================

const normalizeRole = (value) => {

    if (!value) {
        return '';
    }

    return String(value)
        .trim()
        .toLowerCase();
};

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
// NORMALIZE DATE
// =========================================
// Converts an incoming date into:
// YYYY-MM-DD
//
// Example:
// 2026-09-23T08:30:00.000Z
//        ↓
// 2026-09-23
//
// Uses local calendar components so the
// attendance day does not unexpectedly
// shift because of UTC conversion.
// =========================================

const normalizeAttendanceDate = (value) => {

    if (!value) {
        return null;
    }

    const parsedDate = new Date(value);

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

// =========================================
// PARSE DATE
// =========================================

const parseValidDate = (value) => {

    if (!value) {
        return null;
    }

    const parsedDate = new Date(value);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return null;
    }

    return parsedDate;
};

// =========================================
// CHECK MAIN ADMIN
// =========================================

const isMainAdmin = (req) => {

    const role =
        normalizeRole(
            req.admin.role
        );

    return MAIN_ADMIN_ROLES.includes(
        role
    );
};

// =========================================
// CHECK BRANCH USER
// =========================================

const isBranchUser = (req) => {

    const role =
        normalizeRole(
            req.admin.role
        );

    return BRANCH_USER_ROLES.includes(
        role
    );
};

// =========================================
// GET ACCESSIBLE BRANCH
// =========================================

const getAccessibleBranch = (req) => {

    const role =
        normalizeRole(
            req.admin.role
        );

    // Main admin can access all branches.
    if (
        MAIN_ADMIN_ROLES.includes(
            role
        )
    ) {
        return null;
    }

    // Receptionist/staff only get
    // their assigned branch.
    if (
        BRANCH_USER_ROLES.includes(
            role
        )
    ) {

        return normalizeBranch(
            req.admin.gymBranch ||
            req.admin.branchName ||
            req.admin.branch
        );
    }

    return null;
};

// =========================================
// GET WRITE BRANCH
// =========================================

const getWriteBranch = (
    req,
    requestedBranch
) => {

    const role =
        normalizeRole(
            req.admin.role
        );

    // Main admin chooses branch.
    if (
        MAIN_ADMIN_ROLES.includes(
            role
        )
    ) {

        return normalizeBranch(
            requestedBranch
        );
    }

    // Branch user always uses
    // their assigned branch.
    if (
        BRANCH_USER_ROLES.includes(
            role
        )
    ) {

        return normalizeBranch(
            req.admin.gymBranch ||
            req.admin.branchName ||
            req.admin.branch
        );
    }

    return null;
};

// =========================================
// VALIDATE ROLE
// =========================================

const validateRole = (req, res) => {

    const role =
        normalizeRole(
            req.admin && req.admin.role
        );

    if (!role) {

        res.status(403).json({
            message: 'Your account role is not configured.',
        });

        return false;
    }

    if (!MAIN_ADMIN_ROLES.includes(
            role
        ) &&
        !BRANCH_USER_ROLES.includes(
            role
        )
    ) {

        res.status(403).json({
            message: 'You are not authorized to access attendance records.',
        });

        return false;
    }

    return true;
};

// =========================================
// VALIDATE BRANCH USER BRANCH
// =========================================

const validateBranchUserBranch = (
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

// =========================================
// VALIDATE CHECK-IN / CHECK-OUT TIMES
// =========================================

const validateAttendanceTimes = (
    checkInTime,
    checkOutTime
) => {

    let parsedCheckIn = null;
    let parsedCheckOut = null;

    // =========================================
    // CHECK-IN
    // =========================================

    if (checkInTime !== undefined &&
        checkInTime !== null &&
        checkInTime !== '') {

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

    // =========================================
    // CHECK-OUT
    // =========================================

    if (checkOutTime !== undefined &&
        checkOutTime !== null &&
        checkOutTime !== '') {

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

    // =========================================
    // CHECK-IN VS CHECK-OUT
    // =========================================

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

// =========================================
// MARK ATTENDANCE
// =========================================

const markAttendance = async(
    req,
    res
) => {

    try {

        // =========================================
        // ROLE
        // =========================================

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

        // =========================================
        // MEMBER VALIDATION
        // =========================================

        if (!member) {

            return res.status(400).json({
                message: 'Member is required.',
            });
        }

        // =========================================
        // DATE VALIDATION
        // =========================================

        const attendanceDay =
            normalizeAttendanceDate(
                date || new Date()
            );

        if (!attendanceDay) {

            return res.status(400).json({
                message: 'Invalid attendance date.',
            });
        }

        const attendanceDate =
            parseValidDate(
                date || new Date()
            );

        if (!attendanceDate) {

            return res.status(400).json({
                message: 'Invalid attendance date.',
            });
        }

        // =========================================
        // TIME VALIDATION
        // =========================================

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

        // =========================================
        // BRANCH
        // =========================================

        const selectedBranch =
            getWriteBranch(
                req,
                gymBranch
            );

        if (!selectedBranch) {

            if (isBranchUser(req)) {

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
        // VERIFY MEMBER
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
        // DUPLICATE CHECK
        // =========================================

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

        // =========================================
        // CREATE ATTENDANCE
        // =========================================

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

        // =========================================
        // DUPLICATE KEY
        // =========================================

        if (
            error &&
            error.code === 11000
        ) {

            return res.status(409).json({

                message: 'Attendance has already been marked for this member on this calendar day.',

            });
        }

        console.error(
            'Mark Attendance Error:',
            error
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};

// =========================================
// GET ALL ATTENDANCE
// =========================================

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

        if (!validateBranchUserBranch(
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

const getAttendanceById = async(
    req,
    res
) => {

    try {

        if (!validateRole(req, res)) {
            return;
        }

        const branch =
            getAccessibleBranch(req);

        if (!validateBranchUserBranch(
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

const updateAttendance = async(
    req,
    res
) => {

    try {

        if (!validateRole(req, res)) {
            return;
        }

        const branch =
            getAccessibleBranch(req);

        if (!validateBranchUserBranch(
                req,
                res,
                branch
            )) {
            return;
        }

        // =========================================
        // FIND EXISTING RECORD
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
        // UPDATE DATA
        // =========================================

        const updateData = {
            ...req.body,
        };

        // =========================================
        // DATE
        // =========================================

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

        // =========================================
        // TIMES
        // =========================================

        const requestedCheckIn =
            updateData.checkInTime !== undefined ?
            updateData.checkInTime :
            existingAttendance.checkInTime;

        const requestedCheckOut =
            updateData.checkOutTime !== undefined ?
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

        // =========================================
        // BRANCH
        // =========================================

        let updateBranch;

        if (branch) {

            // Branch users cannot change branch.
            updateBranch =
                branch;

        } else {

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

        if (!ALLOWED_BRANCHES.includes(
                updateBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }

        // =========================================
        // MEMBER
        // =========================================

        const updateMember =
            updateData.member ||
            existingAttendance.member;

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

        // =========================================
        // DUPLICATE CHECK
        // =========================================
        // Exclude the current attendance record.
        // =========================================

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

        // =========================================
        // FORCE NORMALIZED VALUES
        // =========================================

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

        // =========================================
        // UPDATE
        // =========================================

        try {

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

            // Unique index race-condition protection.
            if (
                error &&
                error.code === 11000
            ) {

                return res.status(409).json({

                    message: 'Attendance already exists for this member on this calendar day.',

                });
            }

            throw error;
        }

    } catch (error) {

        console.error(
            'Update Attendance Error:',
            error
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};

// =========================================
// DELETE ATTENDANCE
// =========================================

const deleteAttendance = async(
    req,
    res
) => {

    try {

        if (!validateRole(req, res)) {
            return;
        }

        const branch =
            getAccessibleBranch(req);

        if (!validateBranchUserBranch(
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
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};

// =========================================
// EXPORT
// =========================================

module.exports = {

    markAttendance,

    getAttendance,

    getAttendanceById,

    updateAttendance,

    deleteAttendance,

};