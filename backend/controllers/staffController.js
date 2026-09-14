const Admin = require('../models/Admin');
// =====================================
// GET ALL STAFF
// =====================================
const mongoose = require('mongoose');


// =====================================================
// GET RECEPTIONIST STAFF
// =====================================================

const getStaff = async(req, res) => {
    try {
        const staff = await Admin.find({
                role: 'receptionist',
            })
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            staff: staff || [],
        });

    } catch (error) {
        console.error(
            'Get Staff Error:',
            error
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
            error: error.message,
        });
    }
};


// =====================================================
// UPDATE STAFF PERMISSIONS
// =====================================================

const updateStaffPermissions = async(req, res) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;


        // ---------------------------------------------
        // VALIDATE ID
        // ---------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid staff ID.',
            });
        }


        // ---------------------------------------------
        // VALIDATE PERMISSIONS
        // ---------------------------------------------

        if (!permissions ||
            typeof permissions !== 'object'
        ) {
            return res.status(400).json({
                message: 'Permissions are required.',
            });
        }


        // ---------------------------------------------
        // FIND RECEPTIONIST
        // ---------------------------------------------

        const staff = await Admin.findOne({
            _id: id,
            role: 'receptionist',
        });

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist not found.',
            });
        }


        // ---------------------------------------------
        // EXISTING PERMISSIONS
        // ---------------------------------------------

        const existingPermissions =
            staff.permissions ?
            staff.permissions.toObject() : {};


        // ---------------------------------------------
        // MERGE PERMISSIONS
        // ---------------------------------------------

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


        // ---------------------------------------------
        // SAVE
        // ---------------------------------------------

        await staff.save();


        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        res.status(200).json({
            message: 'Staff permissions updated successfully.',

            staff: {
                _id: staff._id,
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
            error
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
            error: error.message,
        });
    }
};


// =====================================================
// UPDATE STAFF STATUS
// =====================================================

const updateStaffStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;


        // ---------------------------------------------
        // VALIDATE ID
        // ---------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid staff ID.',
            });
        }


        // ---------------------------------------------
        // VALIDATE STATUS
        // ---------------------------------------------

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status.',
            });
        }


        // ---------------------------------------------
        // FIND RECEPTIONIST
        // ---------------------------------------------

        const staff = await Admin.findOne({
            _id: id,
            role: 'receptionist',
        });

        if (!staff) {
            return res.status(404).json({
                message: 'Receptionist not found.',
            });
        }


        // ---------------------------------------------
        // UPDATE STATUS
        // ---------------------------------------------

        staff.status = status;

        await staff.save();


        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        res.status(200).json({
            message: `
Receptionist $ {
    status === 'active' ?
        'activated' :
        'deactivated'
}
successfully.
`,

            staff: {
                _id: staff._id,
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
            error
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
            error: error.message,
        });
    }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    getStaff,
    updateStaffPermissions,
    updateStaffStatus,
};