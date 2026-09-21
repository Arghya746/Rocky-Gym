const Admin = require('../models/Admin');
const mongoose = require('mongoose');


// =====================================
// GET ACCESSIBLE BRANCH
// =====================================

const getAccessibleBranch = (req) => {

    // Main admin can access both branches
    if (
        req.admin &&
        req.admin.role === 'admin'
    ) {
        return null;
    }

    // Receptionist is restricted
    // to their assigned branch
    if (
        req.admin &&
        req.admin.gymBranch
    ) {
        return req.admin.gymBranch;
    }

    // Fallback for old accounts
    return 'Kalyanpur';
};


// =====================================
// GET ALL RECEPTIONISTS
// =====================================

const getStaff = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);

        const query = {
            role: 'receptionist',
        };

        // Main admin -> both branches
        // Branch user -> assigned branch
        if (branch) {
            query.gymBranch = branch;
        }

        const staff =
            await Admin.find(query)
            .select('-password')
            .sort({
                createdAt: -1,
            })
            .lean();

        res.status(200).json({
            message: 'Staff fetched successfully.',
            staff: staff || [],
        });

    } catch (error) {

        console.error(
            'Get Staff Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =====================================
// UPDATE RECEPTIONIST PERMISSIONS
// =====================================

const updateStaffPermissions = async(
    req,
    res
) => {
    try {

        const { id } = req.params;
        const { permissions } = req.body;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid staff ID.',
            });
        }

        // Validate permissions
        if (!permissions ||
            typeof permissions !== 'object'
        ) {
            return res.status(400).json({
                message: 'Permissions are required.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        const query = {
            _id: id,
            role: 'receptionist',
        };

        // Branch restriction
        if (branch) {
            query.gymBranch = branch;
        }

        const staff =
            await Admin.findOne(query);

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist not found.',
            });
        }

        const existingPermissions =
            staff.permissions ?
            staff.permissions.toObject() :
            {};

        // Keep branch assignment unchanged.
        // Only permissions are updated.
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

            offers: {
                ...(existingPermissions.offers || {}),
                ...(permissions.offers || {}),
            },

            plans: {
                ...(existingPermissions.plans || {}),
                ...(permissions.plans || {}),
            },
        };

        await staff.save();

        res.status(200).json({
            message: 'Staff permissions updated successfully.',

            staff: {
                _id: staff._id,
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                gymBranch: staff.gymBranch,
                status: staff.status,
                permissions: staff.permissions,
            },
        });

    } catch (error) {

        console.error(
            'Update Staff Permissions Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =====================================
// UPDATE RECEPTIONIST STATUS
// =====================================

const updateStaffStatus = async(
    req,
    res
) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid staff ID.',
            });
        }

        // Validate status
        if (!['active', 'inactive']
            .includes(status)
        ) {
            return res.status(400).json({
                message: 'Invalid status.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        const query = {
            _id: id,
            role: 'receptionist',
        };

        // Branch restriction
        if (branch) {
            query.gymBranch = branch;
        }

        const staff =
            await Admin.findOne(query);

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist not found.',
            });
        }

        staff.status = status;

        await staff.save();

        const action =
            status === 'active' ?
            'activated' :
            'deactivated';

        res.status(200).json({
            message: `Receptionist ${action} successfully.`,

            staff: {
                _id: staff._id,
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                gymBranch: staff.gymBranch,
                status: staff.status,
                permissions: staff.permissions,
            },
        });

    } catch (error) {

        console.error(
            'Update Staff Status Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =====================================
// EXPORT CONTROLLERS
// =====================================

module.exports = {
    getStaff,
    updateStaffPermissions,
    updateStaffStatus,
};