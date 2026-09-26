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

const normalizeBranches = (branches) => {
    if (!Array.isArray(branches)) {
        return [];
    }

    return Array.from(
        new Set(
            branches
            .map(normalizeBranch)
            .filter((branch) =>
                VALID_BRANCHES.includes(branch)
            )
        )
    );
};


// =====================================================
// CHECK MAIN ADMIN
// =====================================================

const isMainAdmin = (req) => {
    return Boolean(
        req.admin &&
        MAIN_ADMIN_ROLES.includes(
            req.admin.role
        )
    );
};


// =====================================================
// GET ACCESSIBLE BRANCHES
// =====================================================

const getAccessibleBranches = (req) => {
    if (!req.admin) {
        return [];
    }

    /*
     * Main admin can manage both branches.
     */
    if (isMainAdmin(req)) {
        return [...VALID_BRANCHES];
    }

    /*
     * New multi-branch receptionist.
     */
    const multiBranches =
        normalizeBranches(
            req.admin.gymBranches
        );

    if (multiBranches.length > 0) {
        return multiBranches;
    }

    /*
     * Backward compatibility for old accounts.
     */
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
// GET ACTIVE BRANCH
// =====================================================
//
// The frontend can send:
// ?gymBranch=Kalyanpur
//
// or:
//
// body.gymBranch
//
// If no branch is supplied:
// use the first assigned branch for compatibility.
//

const getActiveBranch = (req) => {
    const accessibleBranches =
        getAccessibleBranches(req);

    if (
        accessibleBranches.length === 0
    ) {
        return '';
    }

    /*
     * Main admin can explicitly select a branch.
     */
    const requestedBranch =
        normalizeBranch(
            req.query.gymBranch ||
            req.body.gymBranch ||
            req.headers['x-gym-branch'] ||
            ''
        );

    if (requestedBranch) {
        if (
            accessibleBranches.includes(
                requestedBranch
            )
        ) {
            return requestedBranch;
        }

        /*
         * Requested branch isn't allowed.
         */
        return '';
    }

    /*
     * No explicit branch:
     * first accessible branch.
     */
    return accessibleBranches[0];
};


// =====================================================
// STAFF RESPONSE
// =====================================================

const serializeStaff = (staff) => {
    if (!staff) {
        return null;
    }

    return {
        _id: staff._id,
        id: staff._id,

        name: staff.name,

        email: staff.email,

        role: staff.role,

        gymBranches: normalizeBranches(
            staff.gymBranches
        ),

        /*
         * Legacy field is returned too.
         */
        gymBranch: normalizeBranch(
            staff.gymBranch
        ) || null,

        status: staff.status,

        permissions: staff.permissions || {},
    };
};


// =====================================================
// GET ALL RECEPTIONISTS
// =====================================================
// GET /api/admin/staff
// =====================================================

const getStaff = async(
    req,
    res
) => {
    try {

        const accessibleBranches =
            getAccessibleBranches(req);

        /*
         * A branch user must have at least one
         * assigned branch.
         */
        if (!isMainAdmin(req) &&
            accessibleBranches.length === 0
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        const query = {
            role: 'receptionist',
        };

        /*
         * Main admin:
         * return all receptionists.
         *
         * Receptionist:
         * only return receptionists who share
         * at least one accessible branch.
         */
        if (!isMainAdmin(req)) {

            query.gymBranches = {
                $in: accessibleBranches,
            };
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
// UPDATE RECEPTIONIST BRANCHES
// =====================================================
// PUT /api/admin/staff/:id/branches
//
// Body:
//
// {
//     "gymBranches": [
//         "Kalyanpur",
//         "Gopalpur"
//     ]
// }
// =====================================================

const updateStaffBranches = async(
    req,
    res
) => {
    try {

        /*
         * Only main admin can change branch
         * assignments.
         */
        if (!isMainAdmin(req)) {
            return res.status(403).json({
                message: 'Only the main admin can assign receptionist branches.',
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid staff ID.',
            });
        }

        const {
            gymBranches,
        } = req.body;

        /*
         * Must be an array.
         */
        if (!Array.isArray(gymBranches)) {
            return res.status(400).json({
                message: 'gymBranches must be an array.',
            });
        }

        /*
         * Normalize and remove duplicates.
         */
        const normalizedBranches =
            normalizeBranches(
                gymBranches
            );

        /*
         * Reject invalid branch names.
         *
         * Example:
         *
         * ['Kalyanpur', 'Delhi']
         *
         * should not silently become
         *
         * ['Kalyanpur']
         */
        if (
            normalizedBranches.length !==
            gymBranches.length
        ) {
            return res.status(400).json({
                message: 'Only Kalyanpur and Gopalpur are valid gym branches.',
            });
        }

        /*
         * Receptionist must have at least one
         * branch.
         */
        if (
            normalizedBranches.length === 0
        ) {
            return res.status(400).json({
                message: 'Select at least one gym branch.',
            });
        }

        const staff =
            await Admin.findOne({
                _id: id,
                role: 'receptionist',
            });

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist not found.',
            });
        }

        /*
         * Save the NEW authoritative field.
         */
        staff.gymBranches =
            normalizedBranches;

        /*
         * Clear the old single branch field.
         */
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
// UPDATE RECEPTIONIST PERMISSIONS
// =====================================================
// PUT /api/admin/staff/:id/permissions
// =====================================================

const updateStaffPermissions = async(
    req,
    res
) => {
    try {

        const { id } = req.params;

        const {
            permissions,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid staff ID.',
            });
        }

        if (!permissions ||
            typeof permissions !== 'object' ||
            Array.isArray(permissions)
        ) {
            return res.status(400).json({
                message: 'Permissions are required.',
            });
        }

        /*
         * Only main admin can change permissions.
         */
        if (!isMainAdmin(req)) {
            return res.status(403).json({
                message: 'Only the main admin can update staff permissions.',
            });
        }

        const staff =
            await Admin.findOne({
                _id: id,
                role: 'receptionist',
            });

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist not found.',
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

            plans: {
                ...(existingPermissions.plans || {}),
                ...(permissions.plans || {}),
            },

            offers: {
                ...(existingPermissions.offers || {}),
                ...(permissions.offers || {}),
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
// UPDATE RECEPTIONIST STATUS
// =====================================================
// PUT /api/admin/staff/:id/status
// =====================================================

const updateStaffStatus = async(
    req,
    res
) => {
    try {

        if (!isMainAdmin(req)) {
            return res.status(403).json({
                message: 'Only the main admin can update staff status.',
            });
        }

        const {
            id,
        } = req.params;

        const {
            status,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
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

        const staff =
            await Admin.findOne({
                _id: id,
                role: 'receptionist',
            });

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist not found.',
            });
        }

        staff.status = status;

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