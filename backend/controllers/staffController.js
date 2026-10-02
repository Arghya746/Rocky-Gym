const Admin = require('../models/Admin');
const mongoose = require('mongoose');

// =====================================================
// CONSTANTS
// =====================================================

const VALID_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

const BRANCH_STAFF_ROLES = [
    'receptionist',
    'staff',
];

// =====================================================
// NORMALIZE ROLE
// =====================================================

const normalizeRole = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase();
};

// =====================================================
// NORMALIZE BRANCH
// =====================================================

const normalizeBranch = (value) => {
    if (!value) {
        return '';
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

    return '';
};

// =====================================================
// NORMALIZE BRANCH ARRAY
// =====================================================

const normalizeBranches = (
    branches
) => {
    if (!Array.isArray(branches)) {
        return [];
    }

    return Array.from(
        new Set(
            branches
            .map(normalizeBranch)
            .filter((branch) =>
                VALID_BRANCHES.includes(
                    branch
                )
            )
        )
    );
};

// =====================================================
// MAIN ADMIN
// =====================================================

const isMainAdmin = (req) => {
    return Boolean(
        req.admin &&
        MAIN_ADMIN_ROLES.includes(
            normalizeRole(
                req.admin.role
            )
        )
    );
};


const isBranchStaff = (req) => {
    return Boolean(
        req.admin &&
        BRANCH_STAFF_ROLES.includes(
            normalizeRole(req.admin.role)
        )
    );
};

const canManageStaff = (req) => {
    return isMainAdmin(req) || isBranchStaff(req);
};

// =====================================================
// ACCESSIBLE BRANCHES
// =====================================================

const getAccessibleBranches = (
    req
) => {
    if (!req.admin) {
        return [];
    }

    if (isMainAdmin(req)) {
        return [...VALID_BRANCHES];
    }

    const multiBranches =
        normalizeBranches(
            req.admin.gymBranches
        );

    if (multiBranches.length > 0) {
        return multiBranches;
    }

    const legacyBranch =
        normalizeBranch(
            req.admin.gymBranch
        );

    if (legacyBranch) {
        return [legacyBranch];
    }

    return [];
};

// =====================================================
// STAFF SERIALIZER
// =====================================================

const serializeStaff = (
    staff
) => {
    if (!staff) {
        return null;
    }

    const branches =
        normalizeBranches(
            staff.gymBranches
        );

    return {
        _id: staff._id,
        id: staff._id,

        name: staff.name,

        email: staff.email,

        role: staff.role,

        gymBranches: branches,

        gymBranch: normalizeBranch(
            staff.gymBranch
        ) || null,

        status: staff.status,

        permissions: staff.permissions || {},
    };
};

// =====================================================
// GET STAFF
// GET /api/admin/staff
// =====================================================

const getStaff = async(
    req,
    res
) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const accessibleBranches =
            getAccessibleBranches(req);

        if (!isMainAdmin(req) &&
            accessibleBranches.length === 0
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        const query = {
            role: { $in: ['receptionist', 'staff'] },
        };

        // Branch users can only see
        // receptionists sharing a branch.
        if (!isMainAdmin(req)) {
            query.$or = [
                { gymBranches: { $in: accessibleBranches } },
                { gymBranch: { $in: accessibleBranches } },
            ];
        }

        const staff =
            await Admin.find(query)
            .select('-password')
            .sort({
                createdAt: -1,
            })
            .lean();

        return res.status(200).json({
            message: 'Staff fetched successfully.',

            staff:
                (staff || []).map(
                    serializeStaff
                ),
        });
    } catch (error) {
        console.error(
            'Get Staff Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// =====================================================
// UPDATE STAFF BRANCHES
// PUT /api/admin/staff/:id/branches
// =====================================================

const updateStaffBranches = async(
    req,
    res
) => {
    try {
        if (!canManageStaff(req)) {
            return res.status(403).json({
                message: 'You do not have permission to manage staff accounts.',
            });
        }

        const {
            id,
        } = req.params;

        if (!mongoose.Types.ObjectId.isValid(
                id
            )) {
            return res.status(400).json({
                message: 'Invalid staff ID.',
            });
        }

        const {
            gymBranches,
        } = req.body;

        if (!Array.isArray(gymBranches)) {
            return res.status(400).json({
                message: 'gymBranches must be an array.',
            });
        }

        const normalizedBranches =
            normalizeBranches(
                gymBranches
            );

        // Reject invalid branches rather than
        // silently removing them.
        if (
            normalizedBranches.length !==
            gymBranches.length
        ) {
            return res.status(400).json({
                message: 'Only Kalyanpur and Gopalpur are valid gym branches.',
            });
        }

        if (
            normalizedBranches.length === 0
        ) {
            return res.status(400).json({
                message: 'Select at least one gym branch.',
            });
        }

        const accessibleBranches = getAccessibleBranches(req);

        if (!isMainAdmin(req) && normalizedBranches.some(
                (branch) => !accessibleBranches.includes(branch)
            )) {
            return res.status(403).json({
                message: 'Access denied. You can only assign staff to your accessible gym branches.',
            });
        }

        const staffQuery = {
            _id: id,
            role: { $in: ['receptionist', 'staff'] },
        };

        if (!isMainAdmin(req)) {
            staffQuery.$or = [
                { gymBranches: { $in: getAccessibleBranches(req) } },
                { gymBranch: { $in: getAccessibleBranches(req) } },
            ];
        }

        const staff =
            await Admin.findOne(staffQuery);

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist or staff account not found.',
            });
        }

        staff.gymBranches =
            normalizedBranches;

        // Keep legacy field empty.
        staff.gymBranch = null;

        await staff.save();

        return res.status(200).json({
            message: 'Receptionist branches updated successfully.',

            staff: serializeStaff(staff),
        });
    } catch (error) {
        console.error(
            'Update Staff Branches Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// =====================================================
// UPDATE STAFF PERMISSIONS
// PUT /api/admin/staff/:id/permissions
// =====================================================

const updateStaffPermissions = async(
    req,
    res
) => {
    try {
        if (!canManageStaff(req)) {
            return res.status(403).json({
                message: 'You do not have permission to manage staff accounts.',
            });
        }

        const {
            id,
        } = req.params;

        if (!mongoose.Types.ObjectId.isValid(
                id
            )) {
            return res.status(400).json({
                message: 'Invalid staff ID.',
            });
        }

        const {
            permissions,
        } = req.body;

        if (!permissions ||
            typeof permissions !==
            'object' ||
            Array.isArray(permissions)
        ) {
            return res.status(400).json({
                message: 'Permissions are required.',
            });
        }

        const staffQuery = {
            _id: id,
            role: { $in: ['receptionist', 'staff'] },
        };

        if (!isMainAdmin(req)) {
            staffQuery.$or = [
                { gymBranches: { $in: getAccessibleBranches(req) } },
                { gymBranch: { $in: getAccessibleBranches(req) } },
            ];
        }

        const staff =
            await Admin.findOne(staffQuery);

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist or staff account not found.',
            });
        }

        const existingPermissions =
            staff.permissions ?
            staff.permissions.toObject ?
            staff.permissions.toObject() :
            staff.permissions : {};

        staff.permissions = {
            members: {
                ...(existingPermissions.members || {}),
                ...(permissions.members || {}),
            },

            payments: {
                ...(existingPermissions.payments || {}),
                ...(permissions.payments || {}),
            },

            attendance: {
                ...(existingPermissions.attendance || {}),
                ...(permissions.attendance || {}),
            },

            workouts: {
                ...(existingPermissions.workouts || {}),
                ...(permissions.workouts || {}),
            },

            enquiries: {
                ...(existingPermissions.enquiries || {}),
                ...(permissions.enquiries || {}),
            },

            accessPasses: {
                ...(existingPermissions.accessPasses || {}),
                ...(permissions.accessPasses || {}),
            },

            offers: {
                ...(existingPermissions.offers || {}),
                ...(permissions.offers || {}),
            },

            staff: {
                ...(existingPermissions.staff || {}),
                ...(permissions.staff || {}),
            },
        };

        await staff.save();

        return res.status(200).json({
            message: 'Staff permissions updated successfully.',

            staff: serializeStaff(staff),
        });
    } catch (error) {
        console.error(
            'Update Staff Permissions Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// =====================================================
// UPDATE STAFF STATUS
// PUT /api/admin/staff/:id/status
// =====================================================

const updateStaffStatus = async(
    req,
    res
) => {
    try {
        if (!canManageStaff(req)) {
            return res.status(403).json({
                message: 'You do not have permission to manage staff accounts.',
            });
        }

        const {
            id,
        } = req.params;

        const {
            status,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(
                id
            )) {
            return res.status(400).json({
                message: 'Invalid staff ID.',
            });
        }

        if (![
                'active',
                'inactive',
            ].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status.',
            });
        }

        const staffQuery = {
            _id: id,
            role: { $in: ['receptionist', 'staff'] },
        };

        if (!isMainAdmin(req)) {
            staffQuery.$or = [
                { gymBranches: { $in: getAccessibleBranches(req) } },
                { gymBranch: { $in: getAccessibleBranches(req) } },
            ];
        }

        const staff =
            await Admin.findOne(staffQuery);

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist or staff account not found.',
            });
        }

        staff.status =
            status;

        await staff.save();

        return res.status(200).json({
            message: `Receptionist ${
                    status === 'active'
                        ? 'activated'
                        : 'deactivated'
                } successfully.`,

            staff: serializeStaff(staff),
        });
    } catch (error) {
        console.error(
            'Update Staff Status Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getStaff,
    updateStaffBranches,
    updateStaffPermissions,
    updateStaffStatus,
};