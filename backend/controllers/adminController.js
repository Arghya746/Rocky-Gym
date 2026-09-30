const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ============================================================
   CONSTANTS
============================================================ */

const ALLOWED_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const ALLOWED_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
    'receptionist',
    'staff',
];

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

const RECEPTIONIST_ROLES = [
    'receptionist',
    'staff',
];

/* ============================================================
   DEFAULT RECEPTIONIST PERMISSIONS
============================================================ */

const getDefaultReceptionistPermissions = () => ({
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
        add: false,
        edit: false,
        delete: false,
    },

    offers: {
        view: true,
        add: false,
        edit: false,
        delete: false,
    },

    accessPasses: {
        view: true,
        add: false,
        edit: false,
        delete: false,
    },

    staff: {
        view: false,
        add: false,
        edit: false,
        delete: false,
    },
});

/* ============================================================
   CLEAN PERMISSIONS
============================================================ */

const cleanPermissions = (
    permissions
) => {

    const defaults =
        getDefaultReceptionistPermissions();

    const source =
        permissions &&
        typeof permissions === 'object' ?
        permissions :
        {};

    /*
     * Deliberately create a fresh object.
     *
     * Old "plans" permission is removed.
     */

    return {

        members: {
            ...defaults.members,
            ...(source.members || {}),
        },

        payments: {
            ...defaults.payments,
            ...(source.payments || {}),
        },

        attendance: {
            ...defaults.attendance,
            ...(source.attendance || {}),
        },

        workouts: {
            ...defaults.workouts,
            ...(source.workouts || {}),
        },

        enquiries: {
            ...defaults.enquiries,
            ...(source.enquiries || {}),
        },

        offers: {
            ...defaults.offers,
            ...(source.offers || {}),
        },

        accessPasses: {
            ...defaults.accessPasses,
            ...(source.accessPasses || {}),
        },

        staff: {
            ...defaults.staff,
            ...(source.staff || {}),
        },
    };
};

/* ============================================================
   NORMALIZE BRANCH
============================================================ */

const normalizeBranch = (
    value
) => {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {

        return null;
    }

    /*
     * Support branch objects defensively.
     */

    let rawValue =
        value;

    if (
        typeof value === 'object'
    ) {

        rawValue =
            value.name ||
            value.branchName ||
            value.gymBranch ||
            value._id ||
            '';
    }

    const normalized =
        String(rawValue)
        .trim()
        .toLowerCase();

    if (
        normalized === 'kalyanpur'
    ) {

        return 'Kalyanpur';
    }

    if (
        normalized === 'gopalpur'
    ) {

        return 'Gopalpur';
    }

    return null;
};

/* ============================================================
   NORMALIZE BRANCH ARRAY
============================================================ */

const normalizeBranches = (
    branches
) => {

    if (!Array.isArray(branches)) {

        return [];
    }

    return [
        ...new Set(
            branches
            .map(
                normalizeBranch
            )
            .filter(Boolean)
        ),
    ].filter(
        (branch) =>
        ALLOWED_BRANCHES.includes(
            branch
        )
    );
};

/* ============================================================
   NORMALIZE EMAIL
============================================================ */

const normalizeEmail = (
    email
) => {

    if (!email) {
        return '';
    }

    return String(email)
        .trim()
        .toLowerCase();
};

/* ============================================================
   ROLE HELPERS
============================================================ */

const isMainAdminRole = (
    role
) => {

    return MAIN_ADMIN_ROLES.includes(
        String(role || '')
        .trim()
        .toLowerCase()
    );
};

const isReceptionistRole = (
    role
) => {

    return RECEPTIONIST_ROLES.includes(
        String(role || '')
        .trim()
        .toLowerCase()
    );
};

/* ============================================================
   RESOLVE ADMIN BRANCHES
============================================================ */

const resolveAdminBranches = (
    admin
) => {

    if (!admin) {
        return [];
    }

    let branches = [];

    /*
     * Modern multi-branch field.
     */

    if (
        Array.isArray(
            admin.gymBranches
        )
    ) {

        branches =
            normalizeBranches(
                admin.gymBranches
            );
    }

    /*
     * Legacy fallback.
     */

    if (
        branches.length === 0 &&
        admin.gymBranch
    ) {

        const legacyBranch =
            normalizeBranch(
                admin.gymBranch
            );

        if (legacyBranch) {

            branches = [
                legacyBranch,
            ];
        }
    }

    return branches;
};

/* ============================================================
   REGISTER ADMIN
============================================================ */

const registerAdmin = async(
    req,
    res
) => {

    try {

        const {
            name,
            email,
            password,
            role,
            gymBranch,
            gymBranches,
        } = req.body || {};

        /* --------------------------------------------------------
           REQUIRED FIELDS
        -------------------------------------------------------- */

        const normalizedName =
            String(
                name || ''
            ).trim();

        const normalizedEmail =
            normalizeEmail(email);

        const normalizedPassword =
            String(
                password || ''
            );

        if (!normalizedName ||
            !normalizedEmail ||
            !normalizedPassword
        ) {

            return res.status(400).json({
                message: 'Name, email and password are required.',
            });
        }

        if (
            normalizedName.length < 2
        ) {

            return res.status(400).json({
                message: 'Name must contain at least 2 characters.',
            });
        }

        if (
            normalizedPassword.length < 6
        ) {

            return res.status(400).json({
                message: 'Password must contain at least 6 characters.',
            });
        }

        /* --------------------------------------------------------
           ROLE
        -------------------------------------------------------- */

        const selectedRole =
            String(
                role ||
                'receptionist'
            )
            .trim()
            .toLowerCase();

        if (!ALLOWED_ROLES.includes(
                selectedRole
            )) {

            return res.status(400).json({
                message: 'Invalid role.',
            });
        }

        /* --------------------------------------------------------
           BRANCH RESOLUTION
        -------------------------------------------------------- */

        let selectedBranches = [];

        if (
            isReceptionistRole(
                selectedRole
            )
        ) {

            if (
                Array.isArray(
                    gymBranches
                )
            ) {

                selectedBranches =
                    normalizeBranches(
                        gymBranches
                    );
            }

            if (
                selectedBranches.length === 0 &&
                gymBranch
            ) {

                const legacyBranch =
                    normalizeBranch(
                        gymBranch
                    );

                if (legacyBranch) {

                    selectedBranches = [
                        legacyBranch,
                    ];
                }
            }

            if (
                selectedBranches.length === 0
            ) {

                return res.status(400).json({
                    message: 'At least one valid gym branch is required for a receptionist or staff account.',
                });
            }
        }

        /* --------------------------------------------------------
           MAIN ADMIN
        -------------------------------------------------------- */

        if (
            isMainAdminRole(
                selectedRole
            )
        ) {

            /*
             * Main admins are not tied to one branch.
             */

            selectedBranches = [];
        }

        /* --------------------------------------------------------
           CHECK EXISTING ADMIN
        -------------------------------------------------------- */

        const existingAdmin =
            await Admin.findOne({
                email: normalizedEmail,
            });

        if (existingAdmin) {

            return res.status(400).json({
                message: 'Admin already exists.',
            });
        }

        /* --------------------------------------------------------
           PASSWORD
        -------------------------------------------------------- */

        const hashedPassword =
            await bcrypt.hash(
                normalizedPassword,
                10
            );

        /* --------------------------------------------------------
           PERMISSIONS
        -------------------------------------------------------- */

        const permissions =
            isReceptionistRole(
                selectedRole
            ) ?
            getDefaultReceptionistPermissions() :
            undefined;

        /* --------------------------------------------------------
           LEGACY SINGLE BRANCH
        -------------------------------------------------------- */

        const legacyGymBranch =
            selectedBranches.length === 1 ?
            selectedBranches[0] :
            null;

        /* --------------------------------------------------------
           CREATE ADMIN
        -------------------------------------------------------- */

        const admin =
            await Admin.create({

                name: normalizedName,

                email: normalizedEmail,

                password: hashedPassword,

                role: selectedRole,

                gymBranches: selectedBranches,

                gymBranch: legacyGymBranch,

                status: 'active',

                permissions,
            });

        /* --------------------------------------------------------
           RESPONSE
        -------------------------------------------------------- */

        return res.status(201).json({

            message: 'Admin registered successfully.',

            admin: {

                id: admin._id,

                name: admin.name,

                email: admin.email,

                role: admin.role,

                gymBranches: admin.gymBranches || [],

                gymBranch: admin.gymBranch || null,

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

/* ============================================================
   LOGIN ADMIN
============================================================ */

const loginAdmin = async(
    req,
    res
) => {

    try {

        const {
            email,
            password,
        } = req.body || {};

        /* --------------------------------------------------------
           REQUIRED FIELDS
        -------------------------------------------------------- */

        if (!email ||
            !password
        ) {

            return res.status(400).json({
                message: 'Email and password are required.',
            });
        }

        const normalizedEmail =
            normalizeEmail(email);

        if (!normalizedEmail) {

            return res.status(400).json({
                message: 'Valid email is required.',
            });
        }

        /* --------------------------------------------------------
           FIND ADMIN
        -------------------------------------------------------- */

        const admin =
            await Admin.findOne({
                email: normalizedEmail,
            });

        if (!admin) {

            return res.status(401).json({
                message: 'Invalid email or password.',
            });
        }

        /* --------------------------------------------------------
           ACCOUNT STATUS
        -------------------------------------------------------- */

        const accountStatus =
            String(
                admin.status || ''
            )
            .trim()
            .toLowerCase();

        if (
            accountStatus !== 'active'
        ) {

            return res.status(403).json({
                message: 'Your account has been deactivated.',
            });
        }

        /* --------------------------------------------------------
           PASSWORD
        -------------------------------------------------------- */

        const isPasswordCorrect =
            await bcrypt.compare(
                String(password),
                admin.password
            );

        if (!isPasswordCorrect) {

            return res.status(401).json({
                message: 'Invalid email or password.',
            });
        }

        /* --------------------------------------------------------
           ROLE
        -------------------------------------------------------- */

        const normalizedRole =
            String(
                admin.role || ''
            )
            .trim()
            .toLowerCase();

        if (!ALLOWED_ROLES.includes(
                normalizedRole
            )) {

            return res.status(403).json({
                message: 'Your account has an invalid role configuration.',
            });
        }

        /* --------------------------------------------------------
           RESOLVE BRANCH ACCESS
        -------------------------------------------------------- */

        let gymBranches =
            resolveAdminBranches(
                admin
            );

        if (
            isReceptionistRole(
                normalizedRole
            ) &&
            gymBranches.length === 0
        ) {

            console.error(
                '[LOGIN BRANCH ERROR]',
                JSON.stringify({
                    email: normalizedEmail,

                    role: normalizedRole,

                    dbGymBranches: admin.gymBranches,

                    dbGymBranch: admin.gymBranch,

                    resolvedBranches: gymBranches,
                })
            );

            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch. Please contact the administrator.',
            });
        }

        /* --------------------------------------------------------
           MAIN ADMIN
        -------------------------------------------------------- */

        if (
            isMainAdminRole(
                normalizedRole
            )
        ) {

            /*
             * Empty array represents unrestricted
             * branch access in the stored admin data.
             */

            gymBranches = [];
        }

        /* --------------------------------------------------------
           LEGACY SINGLE BRANCH
        -------------------------------------------------------- */

        const gymBranch =
            gymBranches.length === 1 ?
            gymBranches[0] :
            null;

        /* --------------------------------------------------------
           CLEAN RECEPTIONIST PERMISSIONS
        -------------------------------------------------------- */

        let permissions =
            admin.permissions;

        if (
            isReceptionistRole(
                normalizedRole
            )
        ) {

            const cleanedPermissions =
                cleanPermissions(
                    permissions
                );

            const permissionsChanged =
                JSON.stringify(
                    permissions || {}
                ) !==
                JSON.stringify(
                    cleanedPermissions
                );

            permissions =
                cleanedPermissions;

            if (
                permissionsChanged
            ) {

                admin.permissions =
                    permissions;

                await admin.save();
            }
        }

        /* --------------------------------------------------------
           JWT SECRET
        -------------------------------------------------------- */

        const jwtSecret =
            process.env.JWT_SECRET;

        if (!jwtSecret ||
            !String(jwtSecret).trim()
        ) {

            console.error(
                '[LOGIN] JWT_SECRET is not configured.'
            );

            return res.status(500).json({
                message: 'Server configuration error.',
            });
        }

        /* --------------------------------------------------------
           JWT PAYLOAD
        -------------------------------------------------------- */

        const payload = {

            id: admin._id.toString(),

            email: admin.email,

            role: normalizedRole,

            gymBranches: gymBranches,

            gymBranch: gymBranch,
        };

        /* --------------------------------------------------------
           CREATE JWT
        -------------------------------------------------------- */

        const token =
            jwt.sign(
                payload,
                jwtSecret, {
                    expiresIn: '1d',
                }
            );

        /* --------------------------------------------------------
           LOGIN RESPONSE
        -------------------------------------------------------- */

        return res.status(200).json({

            message: 'Login successful.',

            token,

            admin: {

                id: admin._id,

                name: admin.name,

                email: admin.email,

                role: normalizedRole,

                gymBranches: gymBranches,

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

/* ============================================================
   EXPORT
============================================================ */

module.exports = {
    registerAdmin,
    loginAdmin,
};