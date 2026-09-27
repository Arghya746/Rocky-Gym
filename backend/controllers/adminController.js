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
        delete: false,
    },

    plans: {
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
});


/* ============================================================
   NORMALIZE BRANCH
   ============================================================ */

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


/* ============================================================
   NORMALIZE BRANCH ARRAY
   ============================================================ */

const normalizeBranches = (branches) => {
    if (!Array.isArray(branches)) {
        return [];
    }

    return [
        ...new Set(
            branches
            .map(normalizeBranch)
            .filter(Boolean)
        ),
    ].filter((branch) =>
        ALLOWED_BRANCHES.includes(branch)
    );
};


/* ============================================================
   NORMALIZE EMAIL
   ============================================================ */

const normalizeEmail = (email) => {
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

const isMainAdminRole = (role) =>
    MAIN_ADMIN_ROLES.includes(
        String(role || '').trim().toLowerCase()
    );

const isReceptionistRole = (role) =>
    RECEPTIONIST_ROLES.includes(
        String(role || '').trim().toLowerCase()
    );


/* ============================================================
   RESOLVE ADMIN BRANCHES
   ------------------------------------------------------------
   New system:
       gymBranches: ['Kalyanpur', 'Gopalpur']

   Legacy system:
       gymBranch: 'Kalyanpur'
   ============================================================ */

const resolveAdminBranches = (admin) => {
    if (!admin) {
        return [];
    }

    let branches = [];

    /* New multi-branch field */
    if (Array.isArray(admin.gymBranches)) {
        branches = normalizeBranches(
            admin.gymBranches
        );
    }

    /* Legacy fallback */
    if (
        branches.length === 0 &&
        admin.gymBranch
    ) {
        const legacyBranch =
            normalizeBranch(
                admin.gymBranch
            );

        if (legacyBranch) {
            branches = [legacyBranch];
        }
    }

    return branches;
};


/* ============================================================
   REGISTER ADMIN
   ============================================================ */

const registerAdmin = async(req, res) => {
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

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required.',
            });
        }


        /* --------------------------------------------------------
           ROLE
        -------------------------------------------------------- */

        const selectedRole = String(
                role || 'receptionist'
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
           EMAIL
        -------------------------------------------------------- */

        const normalizedEmail =
            normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({
                message: 'Valid email is required.',
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
            /* New multi-branch field */
            if (Array.isArray(gymBranches)) {
                selectedBranches =
                    normalizeBranches(
                        gymBranches
                    );
            }

            /* Legacy single branch */
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

            /* Branch is mandatory */
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
                String(password),
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
                name: String(name).trim(),

                email: normalizedEmail,

                password: hashedPassword,

                role: selectedRole,

                /* Authoritative field */
                gymBranches: selectedBranches,

                /* Backward compatibility */
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

const loginAdmin = async(req, res) => {
    try {
        const {
            email,
            password,
        } = req.body || {};


        /* --------------------------------------------------------
           REQUIRED FIELDS
        -------------------------------------------------------- */

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required.',
            });
        }


        /* --------------------------------------------------------
           NORMALIZE EMAIL
        -------------------------------------------------------- */

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


        /*
         * IMPORTANT:
         * Check admin BEFORE accessing any admin fields.
         */

        if (!admin) {
            return res.status(401).json({
                message: 'Invalid email or password.',
            });
        }


        /* --------------------------------------------------------
           LOGIN DEBUG
           -------------------------------------------------------- */

        const resolvedBranches =
            resolveAdminBranches(
                admin
            );

        console.log(
            '[LOGIN DEBUG]',
            JSON.stringify({
                email: normalizedEmail,

                found: true,

                role: admin.role || null,

                gymBranches: Array.isArray(
                        admin.gymBranches
                    ) ?
                    admin.gymBranches : [],

                gymBranch: admin.gymBranch ||
                    null,

                resolvedBranches,

                status: admin.status ||
                    null,
            })
        );


        /* --------------------------------------------------------
           ACCOUNT STATUS
        -------------------------------------------------------- */

        if (
            String(admin.status || '')
            .trim()
            .toLowerCase() !== 'active'
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
           RESOLVE MULTI-BRANCH ACCESS
        -------------------------------------------------------- */

        let gymBranches =
            resolveAdminBranches(
                admin
            );


        /* --------------------------------------------------------
           RECEPTIONIST / STAFF
        -------------------------------------------------------- */

        if (
            isReceptionistRole(
                normalizedRole
            )
        ) {
            if (
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
             * Main admins can access all branches.
             *
             * Empty gymBranches means:
             * unrestricted branch access.
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
           PERMISSIONS
        -------------------------------------------------------- */

        let permissions =
            admin.permissions;

        if (
            isReceptionistRole(
                normalizedRole
            ) &&
            (!permissions ||
                typeof permissions !==
                'object'
            )
        ) {
            permissions =
                getDefaultReceptionistPermissions();

            admin.permissions =
                permissions;

            await admin.save();
        }


        /* --------------------------------------------------------
           JWT SECRET
        -------------------------------------------------------- */

        if (!process.env.JWT_SECRET) {
            console.error(
                'JWT_SECRET is not configured.'
            );

            return res.status(500).json({
                message: 'Server configuration error.',
            });
        }


        /* --------------------------------------------------------
           CREATE JWT
        -------------------------------------------------------- */

        const token =
            jwt.sign({
                    id: admin._id.toString(),

                    email: admin.email,

                    role: normalizedRole,

                    /*
                     * Multi-branch access
                     */
                    gymBranches,

                    /*
                     * Legacy compatibility
                     */
                    gymBranch,
                },

                process.env.JWT_SECRET,

                {
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

                /*
                 * IMPORTANT:
                 * Receptionist gets:
                 *
                 * ['Kalyanpur', 'Gopalpur']
                 *
                 * Main admin gets:
                 *
                 * []
                 */
                gymBranches,

                /*
                 * Legacy compatibility
                 */
                gymBranch,

                status: admin.status,

                permissions,
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