const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// ===============================
// ALLOWED GYM BRANCHES
// ===============================

const allowedBranches = [
    'Kalyanpur',
    'Gopalpur',
];


// ===============================
// DEFAULT RECEPTIONIST PERMISSIONS
// ===============================

const defaultReceptionistPermissions = {
    members: {
        view: true,
        add: true,
        edit: true,
        delete: false,
    },

    payments: {
        view: true,
        add: true,
        edit: true,
        delete: false,
    },

    attendance: {
        view: true,
        add: true,
        edit: true,
        delete: false,
    },

    workouts: {
        view: true,
        add: true,
        edit: true,
        delete: false,
    },

    enquiries: {
        view: true,
        delete: false,
    },
};


// ===============================
// ADMIN REGISTER
// ===============================

const registerAdmin = async(req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            gymBranch,
        } = req.body;


        // -------------------------------
        // REQUIRED FIELDS
        // -------------------------------

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required.',
            });
        }


        // -------------------------------
        // VALIDATE ROLE
        // -------------------------------

        const allowedRoles = [
            'admin',
            'receptionist',
        ];

        const selectedRole =
            role || 'receptionist';

        if (!allowedRoles.includes(selectedRole)) {
            return res.status(400).json({
                message: 'Invalid role.',
            });
        }


        // -------------------------------
        // VALIDATE GYM BRANCH
        // -------------------------------

        const selectedBranch =
            gymBranch || 'Kalyanpur';

        if (!allowedBranches.includes(
                selectedBranch
            )) {
            return res.status(400).json({
                message: 'Invalid gym branch.',
            });
        }


        // -------------------------------
        // CHECK EXISTING ADMIN
        // -------------------------------

        const normalizedEmail =
            email.toLowerCase().trim();

        const existingAdmin =
            await Admin.findOne({
                email: normalizedEmail,
            });

        if (existingAdmin) {
            return res.status(400).json({
                message: 'Admin already exists.',
            });
        }


        // -------------------------------
        // HASH PASSWORD
        // -------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // -------------------------------
        // CREATE ADMIN / RECEPTIONIST
        // -------------------------------

        const admin =
            await Admin.create({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,

                role: selectedRole,

                gymBranch: selectedBranch,

                status: 'active',

                permissions: selectedRole ===
                    'receptionist' ?
                    defaultReceptionistPermissions :
                    undefined,
            });


        // -------------------------------
        // RESPONSE
        // -------------------------------

        return res.status(201).json({
            message: 'Admin registered successfully.',

            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                gymBranch: admin.gymBranch,
                status: admin.status,
                permissions: admin.permissions,
            },
        });

    } catch (error) {
        console.error(
            'Admin Register Error:',
            error.message
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// ===============================
// ADMIN LOGIN
// ===============================

const loginAdmin = async(req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;


        // -------------------------------
        // REQUIRED FIELDS
        // -------------------------------

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required.',
            });
        }


        // -------------------------------
        // FIND ADMIN
        // -------------------------------

        const normalizedEmail =
            email.toLowerCase().trim();

        const admin =
            await Admin.findOne({
                email: normalizedEmail,
            });

        if (!admin) {
            return res.status(401).json({
                message: 'Invalid email or password.',
            });
        }


        // -------------------------------
        // CHECK ACCOUNT STATUS
        // -------------------------------

        if (admin.status !== 'active') {
            return res.status(403).json({
                message: 'Your account has been deactivated.',
            });
        }


        // -------------------------------
        // CHECK PASSWORD
        // -------------------------------

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                admin.password
            );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password.',
            });
        }


        // -------------------------------
        // RESOLVE GYM BRANCH
        // -------------------------------

        // Old accounts created before
        // multi-branch support are treated
        // as Kalyanpur until updated.

        const gymBranch =
            allowedBranches.includes(
                admin.gymBranch
            ) ?
            admin.gymBranch :
            'Kalyanpur';


        // -------------------------------
        // ENSURE RECEPTIONIST PERMISSIONS
        // -------------------------------

        let permissions =
            admin.permissions;

        if (
            admin.role === 'receptionist' &&
            !permissions
        ) {
            permissions =
                defaultReceptionistPermissions;

            admin.permissions =
                defaultReceptionistPermissions;

            await admin.save();
        }


        // -------------------------------
        // CREATE JWT
        // -------------------------------

        const token =
            jwt.sign({
                    id: admin._id,
                    email: admin.email,
                    role: admin.role,
                    gymBranch: gymBranch,
                },
                process.env.JWT_SECRET, {
                    expiresIn: '1d',
                }
            );


        // -------------------------------
        // RESPONSE
        // -------------------------------

        return res.status(200).json({
            message: 'Login successful.',

            token,

            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                gymBranch: gymBranch,
                status: admin.status,
                permissions: permissions,
            },
        });

    } catch (error) {
        console.error(
            'Admin Login Error:',
            error.message
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// ===============================
// EXPORT CONTROLLERS
// ===============================

module.exports = {
    registerAdmin,
    loginAdmin,
};