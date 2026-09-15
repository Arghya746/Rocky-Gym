const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');


// ===============================
// PROTECT ROUTES
// ===============================
const protect = async(req, res, next) => {
    try {

        const authHeader =
            req.headers.authorization;

        // No token
        if (!authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {
            return res.status(401).json({
                message: 'Not authorized. No token provided.',
            });
        }

        // Get token
        const token =
            authHeader.split(' ')[1];

        // Verify token
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        // Find admin in database
        const admin =
            await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({
                message: 'User account not found.',
            });
        }

        // Check account status
        if (admin.status !== 'active') {
            return res.status(403).json({
                message: 'Your account has been deactivated.',
            });
        }

        // Attach admin to request
        req.admin = admin;

        // Continue
        next();

    } catch (error) {

        console.error(
            'Auth Error:',
            error.message
        );

        return res.status(401).json({
            message: 'Invalid or expired token.',
        });
    }
};


// ===============================
// ROLE AUTHORIZATION
// ===============================
const authorize = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        if (!allowedRoles.includes(
                req.admin.role
            )) {
            return res.status(403).json({
                message: 'Access denied. You do not have permission.',
            });
        }

        next();
    };
};


// ===============================
// PERMISSION CHECK
// ===============================
const requirePermission = (permission) => {

    return (req, res, next) => {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        // Admin / Owner has full access
        if (req.admin.role === 'admin') {
            return next();
        }

        // Get receptionist permissions
        const permissions =
            req.admin.permissions || {};

        // Example:
        // members.view
        // payments.add
        // attendance.edit
        const parts =
            permission.split('.');

        let current =
            permissions;

        for (const part of parts) {

            current =
                current &&
                current[part];
        }

        // Permission denied
        if (current !== true) {
            return res.status(403).json({
                message: 'Access denied. You do not have permission.',
            });
        }

        next();
    };
};


// ===============================
// EXPORTS
// ===============================

module.exports = protect;

module.exports.protect =
    protect;

module.exports.authorize =
    authorize;

module.exports.requirePermission =
    requirePermission;