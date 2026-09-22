const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');


// ======================================================
// VALID BRANCHES
// ======================================================

const VALID_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];


// ======================================================
// NORMALIZE BRANCH
// ======================================================

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


// ======================================================
// PROTECT ROUTES
// ======================================================

const protect = async(req, res, next) => {

    try {

        // ==================================================
        // JWT SECRET CHECK
        // ==================================================

        if (!process.env.JWT_SECRET) {

            console.error(
                'JWT_SECRET is not configured.'
            );

            return res.status(500).json({
                message: 'Server configuration error.',
            });
        }


        // ==================================================
        // AUTHORIZATION HEADER
        // ==================================================

        const authHeader =
            req.headers.authorization;


        if (!authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {

            return res.status(401).json({
                message: 'Not authorized. No token provided.',
            });
        }


        // ==================================================
        // EXTRACT TOKEN
        // ==================================================

        const token =
            authHeader.substring(7).trim();


        if (!token) {

            return res.status(401).json({
                message: 'Not authorized. Invalid token.',
            });
        }


        // ==================================================
        // VERIFY TOKEN
        // ==================================================

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ==================================================
        // VALIDATE TOKEN ID
        // ==================================================

        if (!decoded || !decoded.id) {

            return res.status(401).json({
                message: 'Invalid authentication token.',
            });
        }


        // ==================================================
        // FIND CURRENT USER
        // ==================================================
        //
        // IMPORTANT:
        //
        // The database account is authoritative.
        //
        // We do NOT trust role/branch from the JWT
        // when the database record is available.
        //

        const admin =
            await Admin.findById(decoded.id).select(
                '-password'
            );


        if (!admin) {

            return res.status(401).json({
                message: 'User account not found.',
            });
        }


        // ==================================================
        // ACCOUNT STATUS
        // ==================================================

        if (admin.status !== 'active') {

            return res.status(403).json({
                message: 'Your account has been deactivated.',
            });
        }


        // ==================================================
        // VALIDATE DATABASE ROLE
        // ==================================================

        if (!['admin', 'receptionist'].includes(
                admin.role
            )) {

            return res.status(403).json({
                message: 'Invalid account role.',
            });
        }


        // ==================================================
        // RESOLVE BRANCH
        // ==================================================

        let adminBranch = null;


        // --------------------------------------------------
        // MAIN ADMIN
        // --------------------------------------------------

        if (admin.role === 'admin') {

            // Main admin controls both branches.
            adminBranch = null;
        }


        // --------------------------------------------------
        // RECEPTIONIST
        // --------------------------------------------------

        if (admin.role === 'receptionist') {

            adminBranch =
                normalizeBranch(
                    admin.gymBranch
                );


            // IMPORTANT:
            //
            // NEVER fall back to Kalyanpur.
            //
            // An unassigned receptionist must not
            // automatically gain access to a branch.

            if (!adminBranch) {

                return res.status(403).json({
                    message: 'Your account is not assigned to a valid gym branch. Please contact the administrator.',
                });
            }
        }


        // ==================================================
        // ATTACH AUTHENTICATED USER
        // ==================================================

        req.admin = admin;


        // ==================================================
        // ATTACH AUTHORITATIVE ROLE
        // ==================================================

        req.adminRole =
            admin.role;


        // ==================================================
        // ATTACH AUTHORITATIVE BRANCH
        // ==================================================

        req.adminBranch =
            adminBranch;


        // ==================================================
        // OPTIONAL JWT INFORMATION
        // ==================================================
        //
        // Keep decoded token available if another
        // controller needs it.
        //
        // Do NOT use decoded.role or decoded.gymBranch
        // for authorization when req.admin is available.
        //

        req.auth = decoded;


        // ==================================================
        // CONTINUE
        // ==================================================

        next();

    } catch (error) {

        console.error(
            'Auth Error:',
            error.message
        );


        // JWT-specific errors
        if (
            error.name === 'TokenExpiredError'
        ) {

            return res.status(401).json({
                message: 'Token has expired. Please login again.',
            });
        }


        if (
            error.name === 'JsonWebTokenError'
        ) {

            return res.status(401).json({
                message: 'Invalid authentication token.',
            });
        }


        return res.status(401).json({
            message: 'Invalid or expired token.',
        });
    }
};


// ======================================================
// ROLE AUTHORIZATION
// ======================================================

const authorize = (...allowedRoles) => {

    return (req, res, next) => {

        // ================================================
        // AUTHENTICATION REQUIRED
        // ================================================

        if (!req.admin) {

            return res.status(401).json({
                message: 'Not authorized.',
            });
        }


        // ================================================
        // DATABASE ROLE
        // ================================================

        const role =
            req.admin.role;


        // ================================================
        // ROLE CHECK
        // ================================================

        if (!allowedRoles.includes(role)) {

            return res.status(403).json({
                message: 'Access denied. You do not have permission.',
            });
        }


        // ================================================
        // CONTINUE
        // ================================================

        next();
    };
};


// ======================================================
// PERMISSION CHECK
// ======================================================
//
// Examples:
//
// requirePermission('members.view')
// requirePermission('members.add')
//
// requirePermission('plans.view')
// requirePermission('plans.add')
//
// requirePermission('offers.view')
// requirePermission('offers.add')
//

const requirePermission = (permission) => {

    return (req, res, next) => {

        // ================================================
        // AUTHENTICATION REQUIRED
        // ================================================

        if (!req.admin) {

            return res.status(401).json({
                message: 'Not authorized.',
            });
        }


        // ================================================
        // VALID PERMISSION FORMAT
        // ================================================

        if (
            typeof permission !== 'string' ||
            !permission.trim()
        ) {

            return res.status(500).json({
                message: 'Invalid permission configuration.',
            });
        }


        // ================================================
        // MAIN ADMIN
        // ================================================
        //
        // Main admin has full permissions.
        //
        // Branch isolation is still enforced by
        // controllers such as Plan/Offer controllers.
        //

        if (
            req.admin.role === 'admin'
        ) {

            return next();
        }


        // ================================================
        // RECEPTIONIST PERMISSIONS
        // ================================================

        const permissions =
            req.admin.permissions || {};


        // ================================================
        // READ NESTED PERMISSION
        // ================================================

        const parts =
            permission
            .split('.')
            .filter(Boolean);


        let current =
            permissions;


        for (const part of parts) {

            if (!current ||
                typeof current !== 'object'
            ) {

                current = undefined;
                break;
            }

            current =
                current[part];
        }


        // ================================================
        // PERMISSION DENIED
        // ================================================

        if (current !== true) {

            return res.status(403).json({
                message: 'Access denied. You do not have permission.',
            });
        }


        // ================================================
        // PERMISSION GRANTED
        // ================================================

        next();
    };
};


// ======================================================
// BRANCH ACCESS CHECK
// ======================================================
//
// Use this middleware when a route receives a branch
// from the request.
//
// Examples:
//
// /api/members?gymBranch=Kalyanpur
//
// /api/plans?gymBranch=Gopalpur
//
// Main admin:
//     Can access either valid branch.
//
// Receptionist:
//     Can access ONLY req.adminBranch.
//
// IMPORTANT:
// The controller should still enforce branch filtering
// for database queries.
//

const authorizeBranch = (req, res, next) => {

    // ================================================
    // AUTHENTICATION REQUIRED
    // ================================================

    if (!req.admin) {

        return res.status(401).json({
            message: 'Not authorized.',
        });
    }


    // ================================================
    // MAIN ADMIN
    // ================================================
    //
    // Main admin can work with both branches.
    //

    if (
        req.admin.role === 'admin'
    ) {

        return next();
    }


    // ================================================
    // RECEPTIONIST MUST HAVE BRANCH
    // ================================================

    if (!req.adminBranch) {

        return res.status(403).json({
            message: 'Your account is not assigned to a gym branch.',
        });
    }


    // ================================================
    // GET REQUESTED BRANCH
    // ================================================

    const requestedBranch =
        normalizeBranch(
            req.query.gymBranch ||
            req.body.gymBranch ||
            req.params.gymBranch
        );


    // ================================================
    // NO EXPLICIT BRANCH
    // ================================================
    //
    // Don't automatically trust a client-supplied
    // branch. The controller can use req.adminBranch.
    //

    if (!requestedBranch) {

        return next();
    }


    // ================================================
    // BRANCH MISMATCH
    // ================================================

    if (
        requestedBranch !==
        req.adminBranch
    ) {

        return res.status(403).json({
            message: 'Access denied. You cannot access another gym branch.',
        });
    }


    // ================================================
    // CONTINUE
    // ================================================

    next();
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = protect;

module.exports.protect =
    protect;

module.exports.authorize =
    authorize;

module.exports.requirePermission =
    requirePermission;

module.exports.authorizeBranch =
    authorizeBranch;