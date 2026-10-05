const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const {
    VALID_BRANCHES,
    MAIN_ADMIN_ROLES,
    RECEPTION_ROLES,
    normalizeRole,
    normalizeBranch,
    normalizeBranches,
    isMainAdminRole,
    isReceptionRole,
    resolveAdminBranches,
    getRequestedBranch,
    getAccessibleBranches,
    getActiveBranch,
} = require('../utils/branchAccess');

/* ============================================================
   VALID ROLES
============================================================ */

const VALID_ROLES = [
    ...MAIN_ADMIN_ROLES,
    ...RECEPTION_ROLES,
];

/* ============================================================
   ROLE HELPERS
============================================================ */

const isMainAdmin = (role) => {
    return isMainAdminRole(role);
};

const isValidRole = (role) => {
    return VALID_ROLES.includes(
        normalizeRole(role)
    );
};

/* ============================================================
   CHECK WHETHER A BRANCH WAS EXPLICITLY REQUESTED
============================================================ */

const hasRequestedBranch = (req) => {
    if (!req) {
        return false;
    }

    /*
     * IMPORTANT:
     * GET requests commonly have no req.body.
     * Therefore every optional request property
     * must be accessed safely.
     */

    const headerBranch =
        req.headers &&
        req.headers['x-gym-branch'];

    const queryGymBranch =
        req.query &&
        req.query.gymBranch;

    const queryBranch =
        req.query &&
        req.query.branch;

    const bodyGymBranch =
        req.body &&
        req.body.gymBranch;

    const bodyBranch =
        req.body &&
        req.body.branch;

    const paramGymBranch =
        req.params &&
        req.params.gymBranch;

    const paramBranch =
        req.params &&
        req.params.branch;

    return [
        headerBranch,
        queryGymBranch,
        queryBranch,
        bodyGymBranch,
        bodyBranch,
        paramGymBranch,
        paramBranch,
    ].some(
        (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
    );
};

/* ============================================================
   AUTHENTICATION MIDDLEWARE
============================================================ */

const protect = async(
    req,
    res,
    next
) => {

    try {

        /* ========================================================
           JWT CONFIGURATION
        ======================================================== */

        const jwtSecret =
            process.env.JWT_SECRET;

        if (!jwtSecret ||
            !String(jwtSecret).trim()
        ) {

            console.error(
                '[AUTH] JWT_SECRET is not configured.'
            );

            return res.status(500).json({
                success: false,
                message: 'Server authentication configuration error.',
            });
        }

        /* ========================================================
           AUTHORIZATION HEADER
        ======================================================== */

        const authHeader =
            req.headers.authorization;

        if (!authHeader ||
            typeof authHeader !== 'string'
        ) {

            return res.status(401).json({
                success: false,
                message: 'Not authorized. No token provided.',
            });
        }

        /* ========================================================
           VERIFY BEARER FORMAT
        ======================================================== */

        if (!/^Bearer\s+/i.test(
                authHeader
            )) {

            return res.status(401).json({
                success: false,
                message: 'Not authorized. Invalid authorization header.',
            });
        }

        /* ========================================================
           EXTRACT TOKEN
        ======================================================== */

        const token =
            authHeader
            .replace(
                /^Bearer\s+/i,
                ''
            )
            .trim();

        if (!token) {

            return res.status(401).json({
                success: false,
                message: 'Not authorized. Invalid token.',
            });
        }

        /* ========================================================
           VERIFY JWT
        ======================================================== */

        let decoded;

        try {

            decoded =
                jwt.verify(
                    token,
                    jwtSecret
                );

        } catch (jwtError) {

            console.error(
                '[AUTH JWT ERROR]',
                jwtError.name,
                jwtError.message
            );

            if (
                jwtError.name ===
                'TokenExpiredError'
            ) {

                return res.status(401).json({
                    success: false,
                    message: 'Token has expired. Please login again.',
                });
            }

            if (
                jwtError.name ===
                'NotBeforeError'
            ) {

                return res.status(401).json({
                    success: false,
                    message: 'Authentication token is not active yet.',
                });
            }

            if (
                jwtError.name ===
                'JsonWebTokenError'
            ) {

                return res.status(401).json({
                    success: false,
                    message: 'Invalid authentication token.',
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.',
            });
        }

        /* ========================================================
           VALIDATE DECODED TOKEN
        ======================================================== */

        if (!decoded ||
            typeof decoded !== 'object' ||
            !decoded.id
        ) {

            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.',
            });
        }

        /* ========================================================
           LOAD ADMIN
        ======================================================== */

        const admin =
            await Admin.findById(
                decoded.id
            ).select('-password');

        if (!admin) {

            return res.status(401).json({
                success: false,
                message: 'User account not found.',
            });
        }

        /* ========================================================
           ACCOUNT STATUS
        ======================================================== */

        const status =
            String(
                admin.status || ''
            )
            .trim()
            .toLowerCase();

        if (
            status !== 'active'
        ) {

            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated.',
            });
        }

        /* ========================================================
           NORMALIZE ROLE
        ======================================================== */

        const role =
            normalizeRole(
                admin.role
            );

        if (!isValidRole(role)) {

            return res.status(403).json({
                success: false,
                message: 'Invalid account role.',
            });
        }

        /* ========================================================
           RESOLVE ACCESSIBLE BRANCHES
        ======================================================== */

        let accessibleBranches = [];

        if (
            isMainAdmin(role)
        ) {

            /*
             * Main admins can access both branches.
             */

            accessibleBranches = [
                ...VALID_BRANCHES,
            ];

        } else if (
            isReceptionRole(role)
        ) {

            /*
             * Receptionist/staff only get
             * their assigned branches.
             */

            accessibleBranches =
                resolveAdminBranches(
                    admin
                );

            if (
                accessibleBranches.length === 0
            ) {

                return res.status(403).json({
                    success: false,
                    message: 'Your account is not assigned to a valid gym branch.',
                });
            }
        }

        /* ========================================================
           REQUESTED BRANCH
        ======================================================== */

        const branchWasRequested =
            hasRequestedBranch(req);

        const requestedBranch =
            branchWasRequested ?
            getRequestedBranch(req) :
            null;

        /*
         * A branch was supplied but could not
         * be normalized.
         */

        if (
            branchWasRequested &&
            !requestedBranch
        ) {

            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch.',
            });
        }

        /* ========================================================
           MAIN ADMIN BRANCH
        ======================================================== */

        if (
            isMainAdmin(role)
        ) {

            /*
             * No branch:
             * ALL BRANCHES
             *
             * Specific branch:
             * selected branch
             */

            if (
                requestedBranch
            ) {

                if (!accessibleBranches.includes(
                        requestedBranch
                    )) {

                    return res.status(403).json({
                        success: false,
                        message: 'Invalid gym branch.',
                    });
                }

                req.adminBranch =
                    requestedBranch;

            } else {

                req.adminBranch =
                    null;
            }
        }

        /* ========================================================
           RECEPTIONIST / STAFF BRANCH
        ======================================================== */

        if (
            isReceptionRole(role)
        ) {

            if (
                requestedBranch
            ) {

                if (!accessibleBranches.includes(
                        requestedBranch
                    )) {

                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. You cannot access another gym branch.',
                    });
                }

                req.adminBranch =
                    requestedBranch;

            } else {

                /*
                 * One assigned branch:
                 * automatically use it.
                 */

                if (
                    accessibleBranches.length === 1
                ) {

                    req.adminBranch =
                        accessibleBranches[0];

                } else {

                    /*
                     * Multiple assigned branches:
                     * require explicit branch selection.
                     */

                    req.adminBranch =
                        null;
                }
            }
        }

        /* ========================================================
           ATTACH AUTHENTICATED ADMIN
        ======================================================== */

        req.admin =
            admin;

        req.adminRole =
            role;

        req.adminBranches =
            accessibleBranches;

        req.auth =
            decoded;

        return next();

    } catch (error) {

        console.error(
            '[AUTH ERROR]',
            error
        );

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};

/* ============================================================
   ROLE AUTHORIZATION
============================================================ */

const authorize = (...allowedRoles) => {

    return (
        req,
        res,
        next
    ) => {

        if (!req.admin) {

            return res.status(401).json({
                success: false,
                message: 'Not authorized.',
            });
        }

        const currentRole =
            normalizeRole(
                req.adminRole ||
                req.admin.role
            );

        const normalizedAllowedRoles =
            allowedRoles.map(
                normalizeRole
            );

        if (!normalizedAllowedRoles.includes(
                currentRole
            )) {

            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission.',
            });
        }

        return next();
    };
};

/* ============================================================
   PERMISSION CHECK
============================================================ */

const requirePermission = (
    permission
) => {

    return (
        req,
        res,
        next
    ) => {

        if (!req.admin) {

            return res.status(401).json({
                success: false,
                message: 'Not authorized.',
            });
        }

        if (
            typeof permission !== 'string' ||
            !permission.trim()
        ) {

            return res.status(500).json({
                success: false,
                message: 'Invalid permission configuration.',
            });
        }

        /* --------------------------------------------------------
           MAIN ADMIN = FULL ACCESS
        -------------------------------------------------------- */

        if (
            isMainAdmin(
                req.adminRole ||
                req.admin.role
            )
        ) {

            return next();
        }

        /* --------------------------------------------------------
           STAFF / RECEPTIONIST
        -------------------------------------------------------- */

        const permissions =
            req.admin.permissions || {};

        const parts =
            permission
            .split('.')
            .map(
                (part) =>
                part.trim()
            )
            .filter(Boolean);

        let current =
            permissions;

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

        const role =
            normalizeRole(
                req.adminRole ||
                req.admin.role
            );

        const legacyReceptionEnquiryView =
            permission === 'enquiries.view' &&
            (current === undefined || current === null) &&
            isReceptionRole(role);

        if (
            current !== true &&
            !legacyReceptionEnquiryView
        ) {

            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission.',
            });
        }

        return next();
    };
};

/* ============================================================
   BRANCH AUTHORIZATION
============================================================ */

const authorizeBranch = (
    req,
    res,
    next
) => {

    if (!req.admin) {

        return res.status(401).json({
            success: false,
            message: 'Not authorized.',
        });
    }

    const role =
        normalizeRole(
            req.adminRole ||
            req.admin.role
        );

    /* ========================================================
       MAIN ADMIN
    ======================================================== */

    if (
        isMainAdmin(role)
    ) {

        /*
         * No branch:
         * ALL BRANCHES
         */

        if (!hasRequestedBranch(req)) {

            req.adminBranch =
                null;

            return next();
        }

        const requestedBranch =
            getRequestedBranch(req);

        if (!requestedBranch) {

            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch.',
            });
        }

        if (!VALID_BRANCHES.includes(
                requestedBranch
            )) {

            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch.',
            });
        }

        req.adminBranch =
            requestedBranch;

        return next();
    }

    /* ========================================================
       RECEPTIONIST / STAFF
    ======================================================== */

    if (!isReceptionRole(role)) {

        return res.status(403).json({
            success: false,
            message: 'Invalid account role.',
        });
    }

    /* --------------------------------------------------------
       ACCESSIBLE BRANCHES
    -------------------------------------------------------- */

    const accessibleBranches =
        getAccessibleBranches(req);

    if (
        accessibleBranches.length === 0
    ) {

        return res.status(403).json({
            success: false,
            message: 'Your account is not assigned to a valid gym branch.',
        });
    }

    /* --------------------------------------------------------
       REQUESTED BRANCH
    -------------------------------------------------------- */

    const branchWasRequested =
        hasRequestedBranch(req);

    const requestedBranch =
        branchWasRequested ?
        getRequestedBranch(req) :
        null;

    if (
        branchWasRequested &&
        !requestedBranch
    ) {

        return res.status(400).json({
            success: false,
            message: 'Invalid gym branch.',
        });
    }

    /* --------------------------------------------------------
       DETERMINE ACTIVE BRANCH
    -------------------------------------------------------- */

    let branch =
        requestedBranch;

    /*
     * Branch already attached by protect().
     */

    if (!branch &&
        req.adminBranch
    ) {

        branch =
            normalizeBranch(
                req.adminBranch
            );
    }

    /*
     * One assigned branch:
     * automatically select it.
     */

    if (!branch &&
        accessibleBranches.length === 1
    ) {

        branch =
            accessibleBranches[0];
    }

    /*
     * Multiple assigned branches.
     *
     * getActiveBranch() will use an explicitly
     * selected branch when available.
     */

    if (!branch &&
        accessibleBranches.length > 1
    ) {

        branch =
            getActiveBranch(req);
    }

    /* --------------------------------------------------------
       VERIFY BRANCH
    -------------------------------------------------------- */

    if (!branch) {

        return res.status(400).json({
            success: false,
            message: 'Please select a gym branch.',
        });
    }

    if (!accessibleBranches.includes(
            branch
        )) {

        return res.status(403).json({
            success: false,
            message: 'Access denied. You cannot access another gym branch.',
        });
    }

    /* --------------------------------------------------------
       SET VERIFIED ACTIVE BRANCH
    -------------------------------------------------------- */

    req.adminBranch =
        branch;

    return next();
};

/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
    protect,
    authorize,
    requirePermission,
    authorizeBranch,

    normalizeRole,
    normalizeBranch,
    normalizeBranches,

    isMainAdmin,
    isReceptionRole,
    isValidRole,

    resolveAdminBranches,
    getRequestedBranch,
    hasRequestedBranch,
};