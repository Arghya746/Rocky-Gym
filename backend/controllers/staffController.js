const Admin = require('../models/Admin');


// =====================================
// GET ALL STAFF
// =====================================

const getStaff = async(req, res) => {
    try {
        const staff = await Admin.find({
                role: 'receptionist',
            })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            staff,
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
// UPDATE STAFF PERMISSIONS
// =====================================

const updateStaffPermissions = async(req, res) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        if (!permissions) {
            return res.status(400).json({
                message: 'Permissions are required.',
            });
        }

        const staff = await Admin.findOne({
            _id: id,
            role: 'receptionist',
        });

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist not found.',
            });
        }

        // Convert existing permissions to a normal object.
        const existingPermissions =
            staff.permissions ?
            staff.permissions.toObject() :
            {};

        // Merge permission sections.
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
        };

        await staff.save();

        res.status(200).json({
            message: 'Staff permissions updated successfully.',

            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
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
// UPDATE STAFF STATUS
// =====================================

const updateStaffStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status.',
            });
        }

        const staff = await Admin.findOne({
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

        res.status(200).json({
            message: `Receptionist ${
                    status === 'active'
                        ? 'activated'
                        : 'deactivated'
                } successfully.`,

            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                role: staff.role,
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