const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// =========================================
// ALLOWED VALUES
// =========================================

const ALLOWED_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const ALLOWED_ROLES = [
    'admin',
    'receptionist',
];


// =========================================
// DEFAULT RECEPTIONIST PERMISSIONS
// =========================================

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

    // =====================================
    // PLANS
    // =====================================

    plans: {
        view: true,
        add: false,
        edit: false,
        delete: false,
    },

    // =====================================
    // OFFERS
    // =====================================

    offers: {
        view: true,
        add: false,
        edit: false,
        delete: false,
    },
};


// =========================================
// NORMALIZE BRANCH
// =========================================

const normalizeBranch = (value) => {

    if (!value) {
        return null;
    }

    const normalized = String(value)
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
// NORMALIZE EMAIL
// =========================================

const normalizeEmail = (email) => {

    if (!email) {
        return '';
    }

    return String(email)
        .trim()
        .toLowerCase();
};


// =========================================
// ADMIN REGISTER
// =========================================

const registerAdmin = async(req, res) => {

    try {

        const {
            name,
            email,
            password,
            role,
            gymBranch,
        } = req.body;


        // =====================================
        // REQUIRED FIELDS
        // =====================================

        if (!name || !email || !password) {

            return res.status(400).json({
                message: 'Name, email and password are required.',
            });
        }


        // =====================================
        // VALIDATE ROLE
        // =====================================

        const selectedRole = role || 'receptionist';

        if (!ALLOWED_ROLES.includes(selectedRole)) {

            return res.status(400).json({
                message: 'Invalid role.',
            });
        }


        // =====================================
        // RESOLVE BRANCH
        // =====================================

        let selectedBranch = null;


        if (selectedRole === 'receptionist') {

            selectedBranch = normalizeBranch(gymBranch);

            if (!selectedBranch) {

                return res.status(400).json({
                    message: 'A valid gym branch is required for a receptionist.',
                });
            }
        }


        // =====================================
        // ADMIN DOES NOT BELONG TO A BRANCH
        // =====================================

        if (selectedRole === 'admin') {
            selectedBranch = null;
        }


        // =====================================
        // NORMALIZE EMAIL
        // =====================================

        const normalizedEmail = normalizeEmail(email);


        if (!normalizedEmail) {

            return res.status(400).json({
                message: 'Valid email is required.',
            });
        }


        // =====================================
        // CHECK EXISTING ADMIN
        // =====================================

        const existingAdmin = await Admin.findOne({
            email: normalizedEmail,
        });


        if (existingAdmin) {

            return res.status(400).json({
                message: 'Admin already exists.',
            });
        }


        // =====================================
        // HASH PASSWORD
        // =====================================

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // =====================================
        // PERMISSIONS
        // =====================================

        const permissions =
            selectedRole === 'receptionist' ?
            defaultReceptionistPermissions :
            undefined;


        // =====================================
        // CREATE ADMIN
        // =====================================

        const admin = await Admin.create({

            name: String(name).trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: selectedRole,

            gymBranch: selectedBranch,

            status: 'active',

            permissions,
        });


        // =====================================
        // RESPONSE
        // =====================================

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
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =========================================
// ADMIN LOGIN
// =========================================

const loginAdmin = async(req, res) => {

    try {

        const {
            email,
            password,
        } = req.body;


        // =====================================
        // REQUIRED FIELDS
        // =====================================

        if (!email || !password) {

            return res.status(400).json({
                message: 'Email and password are required.',
            });
        }


        // =====================================
        // NORMALIZE EMAIL
        // =====================================

        const normalizedEmail = normalizeEmail(email);


        // =====================================
        // FIND ADMIN
        // =====================================

        const admin = await Admin.findOne({
            email: normalizedEmail,
        });


        if (!admin) {

            return res.status(401).json({
                message: 'Invalid email or password.',
            });
        }


        // =====================================
        // ACCOUNT STATUS
        // =====================================

        if (admin.status !== 'active') {

            return res.status(403).json({
                message: 'Your account has been deactivated.',
            });
        }


        // =====================================
        // PASSWORD
        // =====================================

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


        // =====================================
        // VALIDATE STORED BRANCH
        // =====================================

        let gymBranch = null;


        if (admin.role === 'receptionist') {

            gymBranch = normalizeBranch(
                admin.gymBranch
            );


            // ---------------------------------
            // DO NOT FALL BACK TO KALYANPUR
            // ---------------------------------
            //
            // This is important.
            //
            // If a receptionist has no valid
            // branch, do NOT silently assign
            // Kalyanpur.
            //

            if (!gymBranch) {

                return res.status(403).json({
                    message: 'Your account is not assigned to a valid gym branch. Please contact the administrator.',
                });
            }
        }


        // =====================================
        // ADMIN BRANCH
        // =====================================

        if (admin.role === 'admin') {
            gymBranch = null;
        }


        // =====================================
        // ENSURE RECEPTIONIST PERMISSIONS
        // =====================================

        let permissions = admin.permissions;


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


        // =====================================
        // JWT SECRET CHECK
        // =====================================

        if (!process.env.JWT_SECRET) {

            console.error(
                'JWT_SECRET is not configured.'
            );

            return res.status(500).json({
                message: 'Server configuration error.',
            });
        }


        // =====================================
        // CREATE JWT
        // =====================================

        const token = jwt.sign({
                id: admin._id.toString(),

                email: admin.email,

                role: admin.role,

                gymBranch: gymBranch,
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '1d',
            }
        );


        // =====================================
        // RESPONSE
        // =====================================

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
            error
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
    registerAdmin,
    loginAdmin,
};