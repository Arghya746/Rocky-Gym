const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/* ============================================================
   CONSTANTS
   ============================================================ */

const VALID_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

const RECEPTION_ROLES = [
    'receptionist',
    'staff',
];

const VALID_ROLES = [
    ...MAIN_ADMIN_ROLES,
    ...RECEPTION_ROLES,
];


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
   NORMALIZE MULTIPLE BRANCHES
   ============================================================ */

const normalizeBranches = (values) => {
    if (!Array.isArray(values)) {
        return [];
    }

    return Array.from(
        new Set(
            values
            .map(normalizeBranch)
            .filter(Boolean)
        )
    );
};


/* ============================================================
   MAIN ADMIN CHECK
   ============================================================ */

const isMainAdmin = (role) => {
    return MAIN_ADMIN_ROLES.includes(role);
};


/* ============================================================
   RECEPTION / STAFF CHECK
   ============================================================ */

const isReceptionRole = (role) => {
    return RECEPTION_ROLES.includes(role);
};


/* ============================================================
   GET REQUESTED BRANCH
   ============================================================ */

const getRequestedBranch = (req) => {
    const queryBranch =
        req.query.gymBranch;

    const bodyBranch =
        req.body.gymBranch;

    const paramBranch =
        req.params.gymBranch;

    const headerBranch =
        req.headers['x-gym-branch'];

    return normalizeBranch(
        queryBranch ||
        bodyBranch ||
        paramBranch ||
        headerBranch ||
        ''
    );
};


/* ============================================================
   PROTECT ROUTES
   ============================================================ */

const protect = async(req, res, next) => {
    try {
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
           AUTHORIZATION HEADER
           -------------------------------------------------------- */

        const authHeader =
            req.headers.authorization;

        if (!authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {
            return res.status(401).json({
                message: 'Not authorized. No token provided.',
            });
        }


        /* --------------------------------------------------------
           EXTRACT TOKEN
           -------------------------------------------------------- */

        const token =
            authHeader
            .substring(7)
            .trim();

        if (!token) {
            return res.status(401).json({
                message: 'Not authorized. Invalid token.',
            });
        }


        /* --------------------------------------------------------
           VERIFY JWT
           -------------------------------------------------------- */

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        if (!decoded ||
            !decoded.id
        ) {
            return res.status(401).json({
                message: 'Invalid authentication token.',
            });
        }


        /* --------------------------------------------------------
           LOAD CURRENT DATABASE ACCOUNT
           --------------------------------------------------------

           IMPORTANT:
           Database data is authoritative.

           We do not trust role/branch information
           stored inside the JWT if the account exists.
        -------------------------------------------------------- */

        const admin =
            await Admin.findById(
                decoded.id
            ).select('-password');

        if (!admin) {
            return res.status(401).json({
                message: 'User account not found.',
            });
        }


        /* --------------------------------------------------------
           ACCOUNT STATUS
           -------------------------------------------------------- */

        if (admin.status !== 'active') {
            return res.status(403).json({
                message: 'Your account has been deactivated.',
            });
        }


        /* --------------------------------------------------------
           ROLE VALIDATION
           -------------------------------------------------------- */

        if (!VALID_ROLES.includes(
                admin.role
            )) {
            return res.status(403).json({
                message: 'Invalid account role.',
            });
        }


        /* --------------------------------------------------------
           RESOLVE ACCESSIBLE BRANCHES
           -------------------------------------------------------- */

        let accessibleBranches = [];


        /* --------------------------------------------------------
           MAIN ADMIN
           --------------------------------------------------------

           Main admins can work with both branches.
        -------------------------------------------------------- */

        if (
            isMainAdmin(
                admin.role
            )
        ) {
            accessibleBranches = [
                ...VALID_BRANCHES,
            ];
        }


        /* --------------------------------------------------------
           RECEPTIONIST / STAFF
           -------------------------------------------------------- */

        if (
            isReceptionRole(
                admin.role
            )
        ) {
            const storedBranches =
                normalizeBranches(
                    admin.gymBranches
                );

            /* ----------------------------------------------------
               LEGACY FALLBACK
            ---------------------------------------------------- */

            const legacyBranch =
                normalizeBranch(
                    admin.gymBranch
                );

            accessibleBranches =
                storedBranches.length > 0 ?
                storedBranches :
                legacyBranch ? [legacyBranch] : [];


            /* ----------------------------------------------------
               REQUIRE BRANCH ACCESS
            ---------------------------------------------------- */

            if (
                accessibleBranches.length === 0
            ) {
                return res.status(403).json({
                    message: 'Your account is not assigned to a valid gym branch. Please contact the administrator.',
                });
            }
        }


        /* --------------------------------------------------------
           REQUESTED / ACTIVE BRANCH
           -------------------------------------------------------- */

        const requestedBranch =
            getRequestedBranch(req);

        let activeBranch = null;


        /* --------------------------------------------------------
           MAIN ADMIN ACTIVE BRANCH
           -------------------------------------------------------- */

        if (
            isMainAdmin(
                admin.role
            )
        ) {
            if (requestedBranch) {
                activeBranch =
                    requestedBranch;
            }
        }


        /* --------------------------------------------------------
           RECEPTIONIST / STAFF ACTIVE BRANCH
           -------------------------------------------------------- */

        if (
            isReceptionRole(
                admin.role
            )
        ) {
            if (requestedBranch) {

                if (!accessibleBranches.includes(
                        requestedBranch
                    )) {
                    return res.status(403).json({
                        message: 'Access denied. You cannot access another gym branch.',
                    });
                }

                activeBranch =
                    requestedBranch;

            } else {
                /*
                 * Default to the first assigned branch.
                 */
                activeBranch =
                    accessibleBranches[0];
            }
        }


        /* --------------------------------------------------------
           ATTACH AUTHENTICATED USER
           -------------------------------------------------------- */

        req.admin = admin;


        /* --------------------------------------------------------
           ATTACH ROLE
           -------------------------------------------------------- */

        req.adminRole =
            admin.role;


        /* --------------------------------------------------------
           ATTACH ACCESSIBLE BRANCHES
           -------------------------------------------------------- */

        req.adminBranches =
            accessibleBranches;


        /* --------------------------------------------------------
           ATTACH ACTIVE BRANCH
           -------------------------------------------------------- */

        req.adminBranch =
            activeBranch;


        /* --------------------------------------------------------
           ATTACH VERIFIED JWT
           -------------------------------------------------------- */

        req.auth =
            decoded;


        /* --------------------------------------------------------
           CONTINUE
           -------------------------------------------------------- */

        return next();

    } catch (error) {
        console.error(
            'Auth Error:',
            error.message
        );


        /* --------------------------------------------------------
           EXPIRED TOKEN
           -------------------------------------------------------- */

        if (
            error.name ===
            'TokenExpiredError'
        ) {
            return res.status(401).json({
                message: 'Token has expired. Please login again.',
            });
        }


        /* --------------------------------------------------------
           INVALID TOKEN
           -------------------------------------------------------- */

        if (
            error.name ===
            'JsonWebTokenError'
        ) {
            return res.status(401).json({
                message: 'Invalid authentication token.',
            });
        }


        /* --------------------------------------------------------
           OTHER AUTH ERROR
           -------------------------------------------------------- */

        return res.status(401).json({
            message: 'Invalid or expired token.',
        });
    }
};


/* ============================================================
   ROLE AUTHORIZATION
   ============================================================ */

const authorize = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const role =
            req.admin.role;

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                message: 'Access denied. You do not have permission.',
            });
        }

        return next();
    };
};


/* ============================================================
   PERMISSION CHECK
   ============================================================ */

const requirePermission = (permission) => {
    return (req, res, next) => {

        /* --------------------------------------------------------
           AUTHENTICATION
           -------------------------------------------------------- */

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }


        /* --------------------------------------------------------
           VALID PERMISSION
           -------------------------------------------------------- */

        if (
            typeof permission !== 'string' ||
            !permission.trim()
        ) {
            return res.status(500).json({
                message: 'Invalid permission configuration.',
            });
        }


        /* --------------------------------------------------------
           MAIN ADMIN BYPASS
           -------------------------------------------------------- */

        if (
            isMainAdmin(
                req.admin.role
            )
        ) {
            return next();
        }


        /* --------------------------------------------------------
           STAFF PERMISSIONS
           -------------------------------------------------------- */

        const permissions =
            req.admin.permissions || {};


        const parts =
            permission
            .split('.')
            .filter(Boolean);

        let current =
            permissions;


        /* --------------------------------------------------------
           READ NESTED PERMISSION
           -------------------------------------------------------- */

        for (
            const part of parts
        ) {
            if (!current ||
                typeof current !== 'object'
            ) {
                current =
                    undefined;

                break;
            }

            current =
                current[part];
        }


        /* --------------------------------------------------------
           DENIED
           -------------------------------------------------------- */

        if (current !== true) {
            return res.status(403).json({
                message: 'Access denied. You do not have permission.',
            });
        }


        /* --------------------------------------------------------
           GRANTED
           -------------------------------------------------------- */

        return next();
    };
};


/* ============================================================
   BRANCH ACCESS CHECK
   ============================================================ */

const authorizeBranch = (req, res, next) => {

    /* --------------------------------------------------------
       AUTHENTICATION
       -------------------------------------------------------- */

    if (!req.admin) {
        return res.status(401).json({
            message: 'Not authorized.',
        });
    }


    /* --------------------------------------------------------
       MAIN ADMIN
       -------------------------------------------------------- */

    if (
        isMainAdmin(
            req.admin.role
        )
    ) {
        const requestedBranch =
            getRequestedBranch(req);

        /*
         * No branch means the main admin may
         * intentionally operate on all branches.
         */
        if (!requestedBranch) {
            return next();
        }

        if (
            VALID_BRANCHES.includes(
                requestedBranch
            )
        ) {
            req.adminBranch =
                requestedBranch;

            return next();
        }

        return res.status(400).json({
            message: 'Invalid gym branch.',
        });
    }


    /* --------------------------------------------------------
       RECEPTIONIST / STAFF
       -------------------------------------------------------- */

    if (!isReceptionRole(
            req.admin.role
        )) {
        return res.status(403).json({
            message: 'Invalid account role.',
        });
    }


    /* --------------------------------------------------------
       GET ACCESSIBLE BRANCHES
       -------------------------------------------------------- */

    let accessibleBranches =
        normalizeBranches(
            req.admin.gymBranches
        );


    /* --------------------------------------------------------
       LEGACY FALLBACK
       -------------------------------------------------------- */

    if (
        accessibleBranches.length === 0
    ) {
        const legacyBranch =
            normalizeBranch(
                req.admin.gymBranch
            );

        if (legacyBranch) {
            accessibleBranches = [
                legacyBranch,
            ];
        }
    }


    /* --------------------------------------------------------
       NO BRANCH ACCESS
       -------------------------------------------------------- */

    if (
        accessibleBranches.length === 0
    ) {
        return res.status(403).json({
            message: 'Your account is not assigned to a gym branch.',
        });
    }


    /* --------------------------------------------------------
       REQUESTED BRANCH
       -------------------------------------------------------- */

    const requestedBranch =
        getRequestedBranch(req);


    /* --------------------------------------------------------
       NO EXPLICIT BRANCH
       --------------------------------------------------------

       protect() has already selected the active branch.
    -------------------------------------------------------- */

    if (!requestedBranch) {
        if (req.adminBranch) {
            return next();
        }

        return res.status(400).json({
            message: 'Please select a gym branch.',
        });
    }


    /* --------------------------------------------------------
       VERIFY ACCESS
       -------------------------------------------------------- */

    if (!accessibleBranches.includes(
            requestedBranch
        )) {
        return res.status(403).json({
            message: 'Access denied. You cannot access another gym branch.',
        });
    }


    /* --------------------------------------------------------
       SET ACTIVE BRANCH
       -------------------------------------------------------- */

    req.adminBranch =
        requestedBranch;

    return next();
};


/* ============================================================
   EXPORTS
   ============================================================ */

module.exports = protect;

module.exports.protect =
    protect;

module.exports.authorize =
    authorize;

module.exports.requirePermission =
    requirePermission;

module.exports.authorizeBranch =
    authorizeBranch;

module.exports.normalizeBranch =
    normalizeBranch;

module.exports.normalizeBranches =
    normalizeBranches;

module.exports.isMainAdmin =
    isMainAdmin;